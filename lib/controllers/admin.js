var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Pickup = mongoose.model('Pickup'),
  _ = require('lodash')._;

exports.indexPickups = function(req, res) {
  var conditions = {};
  if (req.query.status) {
    conditions.status = req.query.status;
  }
  Pickup.find(conditions).sort("-_id").exec(function(err, pickups) {
    res.send(pickups);
  });
}

exports.pickupsSummary = function(req, res) {
  Pickup.aggregate({
    $group: {
      _id: '$status',
      total: {$sum: 1},
      weight: {$sum: '$weight'}
    }
  }).exec().then(function(results) {
    var summary = {};
    results.forEach(function(group) {
      summary[group._id] = _.pick(group, 'total', 'weight');
    });
    res.send(summary);
  });
}

exports.indexUsers = function(req, res) {
  User.active().exec(function(err, users) {
    res.send(users);
  });
};

exports.updateUser = function(req, res, next) {
  User.findById(req.params.id).exec().then(function(user) {
    user.set(req.body);
    console.log(user);
    user.save(function(err, user) {
      res.send(user);
    });
  });
};

exports.deleteUser = function(req, res, next) {
  User.findById(req.params.id).exec().then(function(user) {
    user.deleted = true;
    user.save(function(err, user) {
      res.send(user);
    });
  });
};
