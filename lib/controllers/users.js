'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Pickup = mongoose.model('Pickup'),
    passport = require('passport'),
    Q = require('q'),
    _ = require('lodash')._;

/**
 * Create user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.save(function(err) {
    if (err) {
      // Manually provide our own message for 'unique' validation errors, can't do it from schema
      if(err.errors && err.errors.email.type === 'Value is not unique.') {
        err.errors.email.type = 'The specified email address is already in use.';
      }
      return res.json(400, err);
    }

    req.logIn(newUser, function(err) {
      if (err) return next(err);
      return res.json(req.user.userInfo);
    });
  });
};

/**
 *  Get profile of specified user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(new Error('Failed to load User'));
    if (user) {
      var attributes = user.toObject();
      res.send(_.pick(attributes, 'name', 'organizationName', 'location', 'phone', 'email', 'roleTags', 'notes'));
    } else {
      res.send(404, 'USER_NOT_FOUND');
    }
  });
};

exports.near = function(req, res, next) {
  var find = {};
  var radius = req.query.radius || 25;
  var promise;

  if (req.query.nearType) {
    promise = eval(req.query.nearType).findById(req.query.nearId).exec(); //gross
  } else {
    promise = Q(req.user);
  }

  promise.then(function(nearObject) {
    var query = {};
    if (req.query.withRole) {
      query.roleTags = {$in: [req.query.withRole]};
    } else {
      query.roleTags = {$in: ['agency']};
    }
    return User.nearTo(nearObject, query, radius);
  }).then(function(users) {
    res.send(users);
  });
};

/**
 * Change password
 */
exports.updateProfile = function(req, res, next) {
  var userId = req.user._id;
  var promise, deferred;
  User.findById(userId, function (err, user) {
    if (!user) {
      return res.send(404);
    }
    if (req.body.oldPassword) {
      var oldPass = String(req.body.oldPassword);
      var newPass = String(req.body.newPassword);
      delete req.body.oldPassword;
      delete req.body.newPassword;
      deferred = Q.defer();
      if(user.authenticate(oldPass)) {
        user.password = newPass;
        deferred.resolve(user);
      } else {
        deferred.reject('Invalid Password');
      }
      promise = deferred.promise;
    } else {
      promise = Q(user);
    }
    promise.then(function(user) {
      user.set(req.body);
      user.save(function(err, user) {
        if (err) {
          res.send(500, err);
        } else {
          res.send(200, user);
        }
      });
    });
  });
};

/**
 * Get current user
 */
exports.me = function(req, res, next) {

  passport.authenticate(['local', 'bearer'], function(err, user, info) {
    res.json(req.user || null);
  })(req, res, next);

};
