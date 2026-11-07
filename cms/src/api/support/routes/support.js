'use strict';

// Support endpoints: the website's form and request counts (checked against STRAPI_API_TOKEN in
// the controller) and the GitHub webhook (checked by its signature).
module.exports = {
  routes: [
    { method: 'POST', path: '/support/requests', handler: 'support.submit', config: { auth: false } },
    { method: 'GET', path: '/support/plugin-requests', handler: 'support.requestCounts', config: { auth: false } },
    { method: 'POST', path: '/support/github', handler: 'support.github', config: { auth: false } },
  ],
};
