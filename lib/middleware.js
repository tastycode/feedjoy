'use strict';

var passport = require('passport');

/**
 * Custom middleware used by the application
 */
module.exports = {
  requiredAuthStrategies: passport.authenticate(['local', 'bearer']),
  optionalAuthStrategies: passport.authenticate(['local', 'bearer', 'anonymous']),
  /**
   *  Protect routes on your api from unauthenticated access
   */
  auth: function auth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send(401);
  },

  authRole: function(requiredRole) {
    return function (req, res, next) {
      if (req.isAuthenticated() && req.user.roleTags.indexOf(requiredRole) > -1) {
        return next();
      }
      res.send(401);
    }
  },

  /**
   * Set a cookie for angular so it knows we have an http session
   */
  setUserCookie: function(req, res, next) {
    if(req.user) {
      res.cookie('user', JSON.stringify(req.user.profile));
    }
    next();
  }
};
