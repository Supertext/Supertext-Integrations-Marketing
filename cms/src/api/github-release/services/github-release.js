'use strict';

const { factories } = require('@strapi/strapi');

const UID = 'api::github-release.github-release';

/** Newest published (non-draft) release of a repo, pre-releases included (0.x plugins are pre-releases). */
async function latestRelease(repo, token) {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=5`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'supertext-integrations-cms',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${repo}`);
  const releases = await res.json();
  return releases.find((r) => !r.draft) || null;
}

module.exports = factories.createCoreService(UID, ({ strapi }) => ({
  latestRelease,

  /** Updates the release info of every integration that has a GitHub repo. Editorial content is never touched. */
  async syncAll() {
    const token = process.env.GITHUB_TOKEN;
    const integrations = await strapi.documents('api::integration.integration').findMany({
      locale: 'en',
      status: 'published',
      fields: ['repo'],
      limit: 500,
    });
    const repos = [...new Set(integrations.map((i) => (i.repo || '').trim()).filter((r) => /^[\w.-]+\/[\w.-]+$/.test(r)))];
    let updated = 0;
    for (const repo of repos) {
      try {
        const release = await latestRelease(repo, token);
        const data = {
          repo,
          version: release ? release.tag_name.replace(/^v/, '') : null,
          url: release ? release.html_url : null,
          releasedAt: release ? release.published_at : null,
          prerelease: release ? release.prerelease : false,
          syncedAt: new Date().toISOString(),
        };
        const existing = await strapi.db.query(UID).findOne({ where: { repo } });
        if (existing) await strapi.documents(UID).update({ documentId: existing.documentId, data });
        else await strapi.documents(UID).create({ data });
        updated++;
      } catch (error) {
        strapi.log.warn(`[github] ${repo}: ${error.message}`);
      }
    }
    strapi.log.info(`[github] Synced releases of ${updated} of ${repos.length} repos`);
    return { updated, total: repos.length };
  },
}));
