'use strict';

var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    timestamps = require('mongoose-timestamp'),
    _ = require('lodash')._;
  
var authTypes = ['github', 'twitter', 'facebook', 'google'],
    SALT_WORK_FACTOR = 10;

/**
 * User Schema
 */
var UserSchema = new Schema({
  organizationName: String,
  name: String,
  email: {
    type: String,
    unique: true
  },
  type: String,
  role: {
    type: String,
    default: 'user'
  },
  deleted: {type: Boolean, default: false},
  roleTags: [{type: String}],
  hashedPassword: String,
  provider: String,
  minimumWeight: Number,
  salt: String,
  token: String,
  facebook: {},
  twitter: {},
  github: {},
  google: {},
  address: String,
  city: String,
  state: String,
  phone: String,
  hours: String,
  pickup: Boolean,
  notes: String,
  location: { type: {type: String, default: 'Point'}, coordinates: [], text: String}
}, {
  toObject: {
    virtuals: true
  }
});

UserSchema.plugin(timestamps);

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password, this.salt);
  })
  .get(function() {
    return this._password;
  });

// Basic info to identify the current authenticated user in the app
UserSchema
  .virtual('userInfo')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role,
      'provider': this.provider,
      'roleTags': this.roleTags
    };
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'organizationName': this.organizationName,
      'roleTags': this.roleTags,
      'role': this.role,
      'type': this.type,
      'location': this.location,
      'phone': this.phone
    };
  });
    
/**
 * Validations
 */
var validatePresenceOf = function(value) {
  return value && value.length;
};

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

/**
 * Plugins
 */
UserSchema.plugin(uniqueValidator,  { message: 'Value is not unique.' });

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText, this.salt) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return bcrypt.genSaltSync(SALT_WORK_FACTOR);
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password, salt) {
    // hash the password using our new salt
    return bcrypt.hashSync(password, salt);
  },

};

UserSchema.statics.nearTo = function(object, query, radius) {
    var User = mongoose.model('User');
    if (typeof(query) == 'undefined') {
      query = {};
    }
    query = _.defaults(query, {deleted: false});
    return User.aggregate(
      {
       "$geoNear":{
        "uniqueDocs":true,
        "near": object.location.coordinates,
        "spherical":true,
        "distanceField":"d",
        "distanceMultiplier": 3959.0,
        "maxDistance": radius/3959.0,
        "query": query,
        "num":10
       }
      }).exec();
  };

UserSchema.statics.active = function() {
  var User = mongoose.model('User');
  return User.find({deleted: false});
};
UserSchema.index({location: '2dsphere'});


mongoose.model('User', UserSchema);
