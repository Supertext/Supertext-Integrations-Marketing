module.exports = {
  // Every night at 03:17 (server time): latest GitHub release of every integration.
  githubReleases: {
    task: async ({ strapi }) => {
      try {
        await strapi.service('api::github-release.github-release').syncAll();
      } catch (error) {
        strapi.log.warn(`[github] Release sync failed: ${error.message}`);
      }
    },
    options: { rule: '17 3 * * *' },
  },
};
