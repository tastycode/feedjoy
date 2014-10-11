'use strict';

var mongoose = require('mongoose'),
    osm = require('osmgeocoder'),
    Q = require('q'),
    Thing = mongoose.model('Thing'),
    User = mongoose.model('User'),
    Pickup = mongoose.model('Pickup'),
    ObjectId = mongoose.Schema.ObjectId,
    PickupCreator = require('./../modules/pickup_creator'),
    config = require('./../config/config'),
    Agenda = require('agenda'),
    agenda = new Agenda({db: { address: config.mongo.uri } });



exports.createPickup = function(req, res, next) {
  var file = req.files && req.files.file;
  var pickup = req.body;
  if (req.user) {
    pickup.donorUser = req.user._id
  };
  console.log('createPickup, creating pickup: ', pickup);
  var creator = new PickupCreator(pickup, file);
  creator.create().then(function(pickup) {
    res.send(pickup);
  }, function(error) {
    res.status(422).send({error: error});
  });
};

exports.pickupsNear = function(req, res) {
  var find = {};
  if (req.query.status) {
    find.status = req.query.status;
  } else {
    find.status = 'available';
  }
  Pickup.aggregate({
    "$geoNear":{
    "uniqueDocs":true,
    "near": req.user.location.coordinates,
    "spherical":true,
    "distanceField":"d",
    "distanceMultiplier": 3959.0,
    "maxDistance": 10.0/3959.0,
    "query": find,
    "num":10
    }
  }).exec(function(err, pickups) {
    if (pickups) {
      res.send(pickups.map(function(p) {
        var pickup = (new Pickup(p)).toObject();
        pickup.distance = p.d;
        return pickup;
      }));
    } else {
      res.send([]);
    }
  });
};

exports.pickupsClaimed = function(req, res) {
  Pickup.find({claimedUser: req.user._id, status: 'claimed'}).exec(function(err, pickups) {
    res.send(pickups);
  });
};

exports.pickups = function(req, res) {
  var find = {};
  if (req.query.status) {
    find.status = req.query.status;
  }
  if (req.query.relatedBy) {
    find[req.query.relatedBy] = req.user._id;
  };
  console.log('pickups#index', find);
  Pickup.find(find).exec(function(err, pickups) {
    res.send(pickups);
  });
};

exports.showPickup = function(req, res) {
  Pickup.findById(req.params.id).populate('donorUser claimedUser movingUser').exec(function(err, pickup) {
    res.send(pickup);
  });
};

exports.updatePickup = function(req, res) {
  var claiming, completing, moving, unclaiming, unmoving;
  Pickup.findById(req.params.id, function (err, pickup) {
    function isFrom(state, nextState) {
      console.log('transitioning from', pickup.status, ' to ', req.body.status);
      return pickup.status === state && req.body.status === nextState;
    }
    claiming = isFrom('available', 'claimed');
    completing = isFrom('claimed', 'complete') || isFrom('moving', 'complete');
    moving = isFrom('claimed', 'moving');
    unclaiming = isFrom('claimed', 'available');
    unmoving = isFrom('moving', 'claimed');

    if (claiming || unclaiming || completing || moving || unmoving || req.body.status === 'canceled') {
      agenda.schedule('now', 'update donor', {
        id: pickup._id
      });

      if (unclaiming) {
        pickup.claimedUser = null;
      }

      if (claiming) {
        pickup.claimedUser = req.body.claimedUser || req.user._id;
        agenda.schedule('now', 'notify couriers', {
          id: pickup._id
        });
      }

      if (unmoving) {
        pickup.movingUser = null;
      }

      if (moving) {
        pickup.movingUser = req.body.movingUser || req.user._id;
      }

      pickup.status = req.body.status;

      pickup.save(function(err, pickup) {
        res.send(pickup);
      });
    } else {
      res.send({error: 'Pickup has already been taken'});
    }
  });
};
