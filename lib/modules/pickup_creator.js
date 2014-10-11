var mongoose = require('mongoose'),
  Pickup = mongoose.model('Pickup'),
  User = mongoose.model('User'),
  Q = require('q'),
  config = require('./../config/config'),
  sendgrid = require('sendgrid')(config.sendgrid.api_user, config.sendgrid.api_password),
  moment = require('moment'),
  Agenda = require('agenda'),
  agenda = new Agenda({db: { address: config.mongo.uri } }),
  Email = sendgrid.Email;


function preparePickupParams(body) {
  if (body.pickupAt) {
    body.pickupAt = moment(body.pickupAt.replace('"', '')).toDate();
  }
  if (body.finishBy) {
    body.finishBy = moment(body.finishBy.replace('"', '')).toDate();
  }
  if (body.location) {
    var coordinates = body.location.coordinates.map(function(coord) {
      return parseFloat(coord);
    });
    body.location.coordinates = coordinates;
  }
  return body;
}

function PickupCreator(body, file) {
  var pickup, deferred;
  this._pickup = new Pickup(preparePickupParams(body));
  this._file = file;
  console.log('PickupCreator#create: ', this._pickup);
}

PickupCreator.prototype.create = function() {
  var deferred, pickup;

  pickup = Q(this._pickup);
  if (this._file) {
    pickup = pickup.then(this.attachImage(this._file), function(err) {
      console.log('error');
    });
  }


  pickup = pickup.then(this.notifyAgencies);

  return pickup.then(function(p) {
    deferred = Q.defer();
    p.save(function(err, pickup) {
      if (err) {
        console.log('Error saving pickup: ', err);
        deferred.reject(err);
      } else {
        deferred.resolve(pickup);
      }
    });
    return deferred.promise;
  });

}

PickupCreator.prototype.attachImage = function(_file) {
  return function(p) {
    var deferred;
    deferred = Q.defer();
    p.attach('image', _file, function(err, pickup) {
      if (err) {
        console.log('error attaching', err);
        deferred.reject(err);
      } else {
        deferred.resolve(p);
      }
    });
    return deferred.promise;
  }
};

function userShouldReceiveNotification(user, pickup) {
  if (user.minimumWeight) {
    return parseInt(pickup.weight) > parseInt(user.minimumWeight);
  }
  return true;
};
PickupCreator.prototype.notifyAgencies = function(p) {
  agenda.schedule('now', 'notify admins', {id: p._id});
  return p;
};

module.exports = PickupCreator;
