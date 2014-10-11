'use strict';

var api = require('./controllers/api'),
    index = require('./controllers'),
    users = require('./controllers/users'),
    admin = require('./controllers/admin'),
    session = require('./controllers/session');

var middleware = require('./middleware');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.post('/api/users', users.create);
  app.put('/api/users', users.updateProfile);
  app.get('/api/users/me', users.me);
  app.get('/api/users/near', users.near);
  app.get('/api/users/:id', users.show);
  app.get('/api/admin/users', middleware.authRole('admin'), admin.indexUsers);
  app.put('/api/admin/users/:id', middleware.authRole('admin'), admin.updateUser);
  app.del('/api/admin/users/:id', middleware.authRole('admin'), admin.deleteUser);
  app.get('/api/admin/pickups', middleware.authRole('admin'), admin.indexPickups);
  app.get('/api/admin/pickups/summary', admin.pickupsSummary);

  app.get('/api/pickups/near', api.pickupsNear);
  app.get('/api/pickups/near/:status', api.pickupsNear);


  app.post('/api/pickups', middleware.optionalAuthStrategies, api.createPickup);
  app.get('/api/pickups', middleware.optionalAuthStrategies, api.pickups);
  app.get('/api/pickups/:id', api.showPickup);
  app.put('/api/pickups/:id', api.updatePickup);

  app.post('/api/session', session.login);
  app.del('/api/session', session.logout);

  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', middleware.setUserCookie, index.index);
};
