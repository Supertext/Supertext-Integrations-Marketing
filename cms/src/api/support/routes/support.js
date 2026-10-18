'use strict';

// Public support endpoints (no API token): the website's form and the GitHub webhook.
module.exports = {
  routes: [
    { method: 'POST', path: '/support/requests', handler: 'support.submit', config: { auth: false } },
    { method: 'POST', path: '/support/github', handler: 'support.github', config: { auth: false } },
  ],
};
