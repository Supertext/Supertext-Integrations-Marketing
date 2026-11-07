'use strict';

const crypto = require('crypto');
const { redact } = require('./redact');
const { message } = require('./messages');

// Support requests: the website's form → a Support request in the CMS → a GitHub issue in the
// plugin's repo (public, without contact details). The issue gets the label "support", which
// starts the Claude triage workflow in that repo. The GitHub webhook brings labels, answers and
// closing back; the sender is kept up to date by email.
// Plugin requests (a system without a plugin yet) go to the fallback repo with the label
// "plugin-request" instead (no triage): one issue per system, later requests are added to it
// as comments. Their senders are emailed when the system's status changes to in development
// and to live.

const UID = 'api::support-request.support-request';
const KINDS = ['question', 'bug', 'feature', 'request', 'other'];
// Statuses a plugin request's sender hears about, with the email for each.
const STATUS_MAIL = { in_development: ['requestDevSubject', 'requestDev'], live: ['requestLiveSubject', 'requestLive'] };
const REQUEST_LABEL = 'plugin-request';
const LOCALES = ['en', 'de', 'fr', 'it'];
const REPLY_MARK = '<!-- supertext:reply -->';
const INTERNAL_MARK = '<!-- internal -->';
const TEAM = new Set(['OWNER', 'MEMBER', 'COLLABORATOR']);

const fail = (status, message, code) => Object.assign(new Error(message), { status, code });

/** Simple per-IP limit: a few requests per hour (in memory; enough against casual spam). */
const recent = new Map();
function rateLimited(ip, limit = 5, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) for (const [key, list] of recent) if (now - list[list.length - 1] > windowMs) recent.delete(key);
  return hits.length > limit;
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, ...(ip && { remoteip: ip }) });
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body }).catch(() => null);
  const data = response ? await response.json().catch(() => ({})) : {};
  return Boolean(data.success);
}

// Plugin requests may come without a description; the required field then holds a dash.
const NO_TEXT = '–';
const described = (text) => (text && text !== NO_TEXT ? text : '');

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

async function github(path, options = {}) {
  const token = process.env.GITHUB_ISSUES_TOKEN;
  if (!token) throw fail(503, 'GITHUB_ISSUES_TOKEN is not set');
  const response = await fetch(`${(process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/$/, '')}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'supertext-integrations-cms',
    },
  });
  if (!response.ok) throw fail(response.status, `GitHub ${options.method || 'GET'} ${path}: ${response.status} ${await response.text().catch(() => '')}`);
  return response.status === 204 ? null : response.json();
}

/** Markdown-ish text → minimal HTML for the email (paragraphs, links, line breaks). */
function toHtml(text) {
  const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escape(text)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2">$2</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

module.exports = ({ strapi }) => {
  let transport;
  const mailer = () => {
    if (transport !== undefined) return transport;
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST) return (transport = null);
    const nodemailer = require('nodemailer');
    transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
    return transport;
  };

  /** Sends an email to the request's sender; logs instead when no SMTP server is configured. */
  async function notify(request, subjectKey, paragraphs) {
    const locale = request.locale || 'en';
    const site = (process.env.CLIENT_URL || '').replace(/\/$/, '');
    const values = {
      ref: request.reference,
      platform: request.platformName || 'Supertext',
      url: request.issueUrl,
      page: request.platform ? `${site}/${locale}/integrations/${request.platform}` : site,
    };
    const parts = [
      request.name ? `${{ de: 'Guten Tag', fr: 'Bonjour', it: 'Buongiorno' }[locale] || 'Hello'} ${request.name},` : null,
      ...paragraphs.map((p) => (typeof p === 'string' ? p : message(locale, p.key, values))),
      message(locale, 'signature'),
    ].filter(Boolean);
    const text = parts.join('\n\n');
    const subject = message(locale, subjectKey, values);
    const transporter = mailer();
    if (!transporter) {
      strapi.log.info(`[support] No SMTP_HOST: would email ${request.reference} "${subject}"`);
      return false;
    }
    await transporter.sendMail({
      from: process.env.SUPPORT_FROM_EMAIL || 'Supertext <support@supertext.com>',
      replyTo: process.env.SUPPORT_REPLY_TO || undefined,
      to: request.email,
      subject,
      text,
      html: toHtml(text),
    });
    return true;
  }

  const safeNotify = (request, subjectKey, paragraphs) =>
    notify(request, subjectKey, paragraphs).catch((error) => strapi.log.warn(`[support] Email for ${request.reference} failed: ${error.message}`));

  async function findIntegration(slug) {
    if (!slug) return null;
    return strapi.documents('api::integration.integration').findFirst({ locale: 'en', status: 'published', filters: { slug }, fields: ['system', 'slug', 'repo', 'stage'] });
  }

  function issueBody(request) {
    const facts = [
      `**Platform:** ${request.platformName || 'Not specified'}`,
      `**Type (as chosen by the sender):** ${request.kind}`,
      `**Language of the sender:** ${request.locale}`,
      request.systemVersion && `**System version:** ${redact(request.systemVersion)}`,
      request.pluginVersion && `**Plugin version:** ${redact(request.pluginVersion)}`,
    ].filter(Boolean);
    return [
      facts.join('  \n'),
      '',
      described(request.message) ? redact(request.message) : '_No description._',
      '',
      '---',
      `Sent through the Supertext integrations website (${request.reference}). The sender's contact details stay in the Supertext CMS; answers on this issue are emailed to them.`,
      `<!-- supertext:support-request ${request.reference} locale=${request.locale} -->`,
    ].join('\n');
  }

  /** A plugin request: comment on the open issue for the same system, or open one. */
  async function forwardRequest(request) {
    const repo = request.repo;
    const earlier = await strapi.documents(UID).findFirst({
      filters: {
        kind: 'request',
        repo,
        issueNumber: { $notNull: true },
        status: { $ne: 'closed' },
        documentId: { $ne: request.documentId },
        ...(request.platform ? { platform: request.platform } : { platformName: { $eqi: request.platformName } }),
      },
      sort: ['createdAt:asc'],
    });
    const text = described(request.message) ? redact(request.message) : '';
    if (earlier) {
      await github(`/repos/${repo}/issues/${earlier.issueNumber}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          body: [`Another request for **${request.platformName}** (${request.reference}, language ${request.locale}).`, text].filter(Boolean).join('\n\n'),
        }),
      });
      return strapi.documents(UID).update({ documentId: request.documentId, data: { status: 'requested', issueNumber: earlier.issueNumber, issueUrl: earlier.issueUrl } });
    }
    const issue = await github(`/repos/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: `Plugin request: ${request.platformName}`, body: issueBody(request), labels: ['support', REQUEST_LABEL] }),
    });
    return strapi.documents(UID).update({ documentId: request.documentId, data: { status: 'requested', issueNumber: issue.number, issueUrl: issue.html_url } });
  }

  async function forward(request) {
    if (request.kind === 'request') return forwardRequest(request);
    const repo = request.repo;
    const issue = await github(`/repos/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title: redact(request.subject), body: issueBody(request), labels: ['support'] }),
    });
    return strapi.documents(UID).update({
      documentId: request.documentId,
      data: { status: 'forwarded', issueNumber: issue.number, issueUrl: issue.html_url },
    });
  }

  /** One support request's part of a GitHub event. */
  async function handleOne(event, payload, issue, request) {
    if (event === 'issues' && payload.action === 'labeled') {
      const label = payload.label?.name;
      const category = { question: 'question', bug: 'bug', 'feature-request': 'feature' }[label];
      if (!category || request.category === category) return 'unchanged';
      const status = category === 'bug' ? 'bug' : category === 'feature' ? 'feature_request' : request.status;
      await strapi.documents(UID).update({ documentId: request.documentId, data: { category, status } });
      if (category === 'bug') await safeNotify(request, 'bugSubject', [{ key: 'bug' }, { key: 'follow' }]);
      if (category === 'feature') await safeNotify(request, 'featureSubject', [{ key: 'feature' }, { key: 'follow' }]);
      return `labeled ${category}`;
    }

    if (event === 'issues' && payload.action === 'closed') {
      if (request.status === 'closed') return 'unchanged';
      await strapi.documents(UID).update({ documentId: request.documentId, data: { status: 'closed' } });
      const fixed = request.category === 'bug' && issue.state_reason === 'completed';
      // An answered question is closed right after the answer: one email (the answer) is enough.
      const lastReply = (request.replies || []).at(-1);
      if (request.category === 'question' && lastReply && Date.now() - new Date(lastReply.at) < 15 * 60 * 1000) return 'closed';
      await safeNotify(request, 'closedSubject', [{ key: 'closed' }, ...(fixed ? [{ key: 'fixed' }] : []), { key: 'follow' }]);
      return 'closed';
    }

    if (event === 'issue_comment' && payload.action === 'created') {
      const comment = payload.comment || {};
      const body = comment.body || '';
      // Answers meant for the sender: the triage workflow marks them; the team's own
      // comments count too, unless marked internal.
      const forSender =
        body.includes(REPLY_MARK) ||
        (TEAM.has(comment.author_association) && comment.user?.type !== 'Bot' && !body.includes(INTERNAL_MARK));
      if (!forSender) return 'not for the sender';
      const answer = body.replace(/<!--[\s\S]*?-->/g, '').trim();
      if (!answer) return 'empty';
      const replies = [...(request.replies || []), { at: comment.created_at, author: comment.user?.login, url: comment.html_url, body: answer }];
      await strapi.documents(UID).update({
        documentId: request.documentId,
        data: { replies, status: request.status === 'forwarded' || request.status === 'received' ? 'answered' : request.status },
      });
      await safeNotify(request, 'answerSubject', [{ key: 'answer' }, answer, { key: 'follow' }, { key: 'reply' }]);
      return 'answer sent';
    }
    return 'ignored';
  }

  return {
    /** The website's form. Returns the reference; GitHub and email follow without failing the form. */
    async submit(input, { ip }) {
      if (clean(input.website, 10)) throw fail(400, 'Invalid request', 'invalid'); // honeypot
      if (Number(input.elapsedMs) > 0 && Number(input.elapsedMs) < 3000) throw fail(400, 'Invalid request', 'invalid');
      if (rateLimited(ip || 'unknown')) throw fail(429, 'Too many requests. Please try again later.', 'rateLimit');
      if (!(await verifyTurnstile(input.turnstileToken, ip))) throw fail(400, 'Please confirm that you are human.', 'captcha');

      const kind = KINDS.includes(input.kind) ? input.kind : 'question';
      const text = clean(input.message, 10000);
      const email = clean(input.email, 254);
      const integration = await findIntegration(clean(input.platform, 80));
      // A plugin request names a system from the list or types one in; the description is optional.
      const requested = kind === 'request' ? integration?.system || clean(input.requestedSystem, 80) : null;
      if (kind === 'request' && requested.length < 2) throw fail(400, 'Please name the system.', 'system');
      const subject = kind === 'request' ? `Plugin request: ${requested}`.slice(0, 140) : clean(input.subject, 140);
      if (kind !== 'request' && (subject.length < 5 || text.length < 20)) throw fail(400, 'Please describe your request in a few words.', 'tooShort');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(400, 'Please enter a valid email address.', 'email');

      const locale = LOCALES.includes(input.locale) ? input.locale : 'en';
      const created = await strapi.documents(UID).create({
        data: {
          subject,
          message: text || NO_TEXT,
          kind,
          platform: integration?.slug || null,
          platformName: integration?.system || requested || null,
          systemVersion: clean(input.systemVersion, 100) || null,
          pluginVersion: clean(input.pluginVersion, 100) || null,
          name: clean(input.name, 120) || null,
          company: clean(input.company, 120) || null,
          email,
          locale,
          status: 'received',
          // A request for a system that is already in development or live: nothing more to announce.
          notified: kind === 'request' ? ['in_development', 'live'].slice(0, { in_development: 1, live: 2 }[integration?.stage] || 0) : null,
          // Plugins without their own GitHub repo (Drupal lives on drupal.org) and general
          // questions go to the fallback repo.
          repo: integration?.repo || process.env.SUPPORT_FALLBACK_REPO || 'Supertext/Supertext-Integrations-Marketing',
        },
      });
      const reference = `SR-${String(created.id).padStart(4, '0')}`;
      let request = await strapi.documents(UID).update({ documentId: created.documentId, data: { reference } });

      try {
        request = await forward(request);
      } catch (error) {
        strapi.log.warn(`[support] ${reference} not forwarded to GitHub: ${error.message}`);
        await strapi.documents(UID).update({ documentId: request.documentId, data: { status: 'failed', notes: error.message.slice(0, 2000) } });
      }
      if (kind === 'request') await safeNotify(request, 'requestSubject', [{ key: 'requestReceived' }, ...(request.issueUrl ? [{ key: 'publicNote' }] : [])]);
      else await safeNotify(request, 'receivedSubject', [{ key: 'received' }, ...(request.issueUrl ? [{ key: 'publicNote' }] : []), { key: 'reply' }]);
      return { reference, issueUrl: request.issueUrl || null };
    },

    /** Checks the GitHub webhook signature (HMAC-SHA256 of the raw body). */
    verifySignature(raw, signature) {
      const secret = process.env.GITHUB_WEBHOOK_SECRET;
      if (!secret || !raw || !signature) return false;
      const expected = `sha256=${crypto.createHmac('sha256', secret).update(raw).digest('hex')}`;
      const a = Buffer.from(expected);
      const b = Buffer.from(String(signature));
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    },

    /** GitHub webhook: labels, answers and closing of support issues. */
    async handleEvent(event, payload) {
      const issue = payload.issue;
      const repo = payload.repository?.full_name;
      if (!issue || !repo || !(issue.labels || []).some((l) => l.name === 'support')) return 'ignored';
      // Plugin requests for the same system share one issue: everyone who asked hears about it.
      const requests = await strapi.documents(UID).findMany({ filters: { repo, issueNumber: issue.number }, sort: ['createdAt:asc'], limit: 1000 });
      if (!requests.length) return 'unknown issue';
      const results = [];
      for (const request of requests) results.push(await handleOne(event, payload, issue, request));
      return results[0];
    },

    /** Request counts per system (plugin requests), for the roadmap page. */
    async requestCounts() {
      const rows = await strapi.documents(UID).findMany({ filters: { kind: 'request', platform: { $notNull: true } }, fields: ['platform'], limit: 10000 });
      const counts = {};
      for (const { platform } of rows) counts[platform] = (counts[platform] || 0) + 1;
      return counts;
    },

    /**
     * Emails the senders of plugin requests whose system went into development or live since.
     * Runs after an integration is published and at start-up.
     */
    async notifyStatusChanges() {
      const requests = await strapi.documents(UID).findMany({ filters: { kind: 'request', platform: { $notNull: true } }, limit: 10000 });
      const stages = new Map();
      let sent = 0;
      for (const request of requests) {
        if (!stages.has(request.platform)) stages.set(request.platform, (await findIntegration(request.platform))?.stage || null);
        const stage = stages.get(request.platform);
        const notified = request.notified || [];
        if (!STATUS_MAIL[stage] || notified.includes(stage)) continue;
        const [subjectKey, key] = STATUS_MAIL[stage];
        // Live includes development: no "in development" email afterwards.
        const now = stage === 'live' ? ['in_development', 'live'] : ['in_development'];
        await strapi.documents(UID).update({ documentId: request.documentId, data: { notified: [...new Set([...notified, ...now])] } });
        await safeNotify(request, subjectKey, [{ key }]);
        sent++;
      }
      if (sent) strapi.log.info(`[support] Told ${sent} plugin requests about their system's new status`);
      return sent;
    },

    // For tests.
    _issueBody: issueBody,
  };
};
