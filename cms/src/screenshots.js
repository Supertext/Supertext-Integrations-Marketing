'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const SOURCES = require('./seed/screenshots');

const UID = 'api::integration.integration';

/** True when the draft has changes that aren't published yet (then we leave publishing to the editor). */
async function hasUnpublishedChanges(strapi, documentId) {
  const [draft, published] = await Promise.all([
    strapi.documents(UID).findOne({ documentId, locale: 'en', status: 'draft', fields: ['updatedAt'] }),
    strapi.documents(UID).findOne({ documentId, locale: 'en', status: 'published', fields: ['updatedAt'] }),
  ]);
  if (!published) return true;
  return new Date(draft.updatedAt) - new Date(published.updatedAt) > 1000;
}

/**
 * Gives each integration without a screenshot the one listed in seed/screenshots.js,
 * downloaded from its GitHub repo. Runs on every start; does nothing once all are set.
 */
async function importScreenshots(strapi) {
  const items = await strapi.documents(UID).findMany({
    locale: 'en',
    status: 'draft',
    fields: ['slug', 'system', 'repo'],
    populate: ['screenshot'],
    limit: 500,
  });
  const todo = items.filter((i) => !i.screenshot && SOURCES[i.slug] && i.repo);
  if (!todo.length) return;

  const upload = strapi.plugin('upload').service('upload');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'screenshots-'));
  let done = 0;
  try {
    for (const item of todo) {
      const source = SOURCES[item.slug];
      try {
        const res = await fetch(`https://raw.githubusercontent.com/${item.repo}/HEAD/${source}`);
        if (!res.ok) throw new Error(`GitHub ${res.status}`);
        const buffer = Buffer.from(await res.arrayBuffer());
        const ext = path.extname(source).toLowerCase();
        const filename = `${item.slug}-supertext${ext}`;
        const filepath = path.join(dir, filename);
        fs.writeFileSync(filepath, buffer);
        const [file] = await upload.upload({
          data: {
            fileInfo: {
              name: filename,
              alternativeText: `Supertext translation in ${item.system}`,
              caption: `Supertext in ${item.system}`,
            },
          },
          files: {
            filepath,
            originalFilename: filename,
            mimetype: ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png',
            size: buffer.length,
          },
        });
        const publish = !(await hasUnpublishedChanges(strapi, item.documentId));
        await strapi.documents(UID).update({ documentId: item.documentId, locale: 'en', data: { screenshot: file.id } });
        if (publish) await strapi.documents(UID).publish({ documentId: item.documentId, locale: 'en' });
        done++;
      } catch (error) {
        strapi.log.warn(`[setup] Screenshot for ${item.slug}: ${error.message}`);
      }
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  strapi.log.info(`[setup] Imported ${done} of ${todo.length} integration screenshots`);
}

module.exports = { importScreenshots };
