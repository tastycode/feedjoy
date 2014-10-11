

'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    attachments = require('mongoose-attachments'),
    Schema = mongoose.Schema;
/**
 * Petition Schema
 */

var PickupSchema = new Schema({
  address: String,
  city: String,
  state: String,
  location: { type: {type: String, default: 'Point'}, coordinates: [], text: String},
  kind: String,
  weight: Number,
  pickupAt: Date,
  finishBy: Date,
  recurMode: String,
  phone: String,
  donorUser: { type: Schema.ObjectId, ref: 'User'},
  claimedUser: { type: Schema.ObjectId , ref: 'User'},
  movingUser: { type: Schema.ObjectId , ref: 'User'},
  status: {type: String, default: 'available'}
}, { 
  toObject: {
    virtuals: true
  }
});

PickupSchema.index({location: '2dsphere'});
PickupSchema.plugin(timestamps);
PickupSchema.plugin(attachments, {
  directory: 'pickups',
  storage: {
    providerName: 'aws2js',
    options: {
      key: 'AKIAJJ2JCGQREONH6YQQ',
      secret: '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',
      bucket: 'feedjoy-dev'
    }
  },
  properties: {
    image: {
      styles: {
        original: {},
        small: {
          resize: '150x150'
        }
      }
    }
  }
});

PickupSchema.methods.nearby = function(model, radius, filters) {
  try {
    if (typeof(filters) === 'undefined')
      filters = {};  
    var area = { center: [this.location.lng, this.location.lat], radius: radius, unique: true };
    filters.location = {$geoWithin: {$center: [area.center, area.radius]}};
    return model.find(filters).exec();
  } catch (e) {
    console.log(e);
  }
};

var Pickup = mongoose.model('Pickup', PickupSchema);

module.exports = Pickup;
