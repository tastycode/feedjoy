'use strict';

var mongoose = require('mongoose'),
    passport = require('passport'),
    jwt =  require('jwt-simple'),
    _ = require('lodash')._;

/**
 * Logout
 */
exports.logout = function (req, res) {
  req.logout();
  res.send(200);
};

/**
 * Login
 */
exports.login = function (req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
    if (error) return res.json(401, error);

    req.logIn(user, function(err) {
      if (err) return res.send(err);
      if (!user.token) {
        user.token = jwt.encode(user.id, 'feedjoy');
        user.save(function() {
          res.json(_.extend(user.profile, {token: user.token}));
        });
      } else {
        res.json(_.extend(user.profile, {token: user.token}));
      }
    });
  })(req, res, next);
};
