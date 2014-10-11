
'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User')

/**
 * Populate database with seed data
 */
// Clear old users, then add a default user
User.findOne({email: 'thomas.devol@gmail.com'}).exec(function(err, user) {
  if (user) {
    return;
  }
  User.create({
    provider: 'local',
    firstName: 'Tommy',
    lastName: 'Devol',
    name: 'Tommy Devol',
    email: 'thomas.devol@gmail.com',
    role: 'admin',
    roleTags: ['admin'],
    password: 'feedjoy',
    location : {
        "text" : "265 Dolores Street, San Francisco, CA, United States",
        "coordinates" : [ 
            -122.4263981, 
            37.7653666
        ],
        "type" : "Point"
    }
  }, function() {
      console.log('finished populating users');
    }
  );
});
