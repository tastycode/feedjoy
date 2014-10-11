'use strict';


/* common init { */
var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

// Connect to database
var db = mongoose.connect(config.mongo.uri, config.mongo.options);

// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  if (/(.*)\.(js$|coffee$)/.test(file)) {
    require(modelsPath + '/' + file);
  }
});

/* } */

var Agenda = require('agenda'),
    agenda = new Agenda({db: { address: config.mongo.uri } }),
    sendgrid = require('sendgrid')(config.sendgrid.api_user, config.sendgrid.api_password),
    Email = sendgrid.Email,
    Handlebars = require('handlebars'),
    premailer = require('premailer-api'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Pickup = mongoose.model('Pickup'),
    Q = require('q'),
    _ = require('lodash')._;

agenda.define('notify couriers', function(job, done) {
  var jobData = job.attrs.data;
  Pickup.findById(jobData.id).populate('claimedUser donorUser').exec().then(function(pickup) {
    console.log('Notifying couriers', jobData, pickup);
    User.nearTo(pickup, {roleTags: {$in: ['courier']}}, 10).then(function(users){
      users.forEach(function(user) {
        console.log('Notifying Courier', user.email, ' for pickup ', pickup.kind);
        var templatePickup = _.pick(pickup, 'kind', 'location');
        templatePickup.donorUser = _.pick(pickup.donorUser, 'name', 'phone', 'location');
        templatePickup.claimedUser = _.pick(pickup.claimedUser, 'name', 'phone', 'location');
        agenda.schedule('now', 'send email', {
          to: user.email,
          subject: 'Delivery Request: ' + pickup.kind,
          templateName: 'delivery_request',
          pickup: templatePickup
        });
      });
      done();
    }, function(error) { console.log('notify couriers error', error)});
  });
});

agenda.define('notify agencies', function(job, done) {
  var jobData = job.attrs.data;
  Pickup.findById(jobData.id).populate('donorUser').exec().then(function(pickup) {
    User.nearTo(pickup, {roleTags: {$in: ['agency']}}, 10).exec().then(function(users) {
      users.forEach(function(user) {
        console.log('Notifying Agencies', user.email, ' for pickup ', pickup.kind);
        var templatePickup = _.pick(pickup, 'kind', 'location', 'phone', 'weight', 'pickupAt');
        templatePickup.donorUser = _.pick(pickup.donorUser, 'name', 'phone', 'location');
        agenda.schedule('now', 'send email', {
          to: user.email,
          subject: 'New Donation: ' + pickup.kind,
          templateName: 'pickup_request',
          pickup: templatePickup
        });
      });
      done();
    }, function(error) { console.log('notify agencies error', error)});
  });
});

agenda.define('notify admins', function(job, done) {
  var jobData = job.attrs.data;
  Pickup.findById(jobData.id).populate('donorUser').exec().then(function(pickup) {
    User.find({roleTags: {$in: ['admin']}}).exec().then(function(users) {
      users.forEach(function(user) {
        console.log('Notifying Admins', user.email, ' for pickup ', pickup.kind);
        var templatePickup = _.pick(pickup, 'kind', 'location', 'phone', 'weight', 'pickupAt');
        templatePickup.donorUser = _.pick(pickup.donorUser, 'name', 'phone', 'location');
        agenda.schedule('now', 'send email', {
          to: user.email,
          subject: 'Admin Notification: New Donation: ' + pickup.kind,
          templateName: 'pickup_request',
          pickup: templatePickup
        });
      });
      done();
    }, function(error) { console.log('notify admin error', error)});
  });
});

agenda.define('update donor', function(job, done) {
  var jobData = job.attrs.data;
  Pickup.findById(jobData.id).populate('donorUser movingUser claimedUser').exec().then(function(pickup) {
      console.log('Notifying Donors', pickup.donorUser.email, ' for pickup ', pickup.kind);
      var templatePickup = _.pick(pickup, 'kind', 'location', 'phone', 'weight', 'status', 'pickupAt');
      if (pickup.claimedUser) {
        templatePickup.claimedUser = _.pick(pickup.claimedUser, 'name', 'phone', 'location');
      }
      if (pickup.movingUser) {
        templatePickup.movingUser = _.pick(pickup.movingUser, 'name', 'phone', 'location');
      }
      agenda.schedule('now', 'send email', {
        to: pickup.donorUser.email,
        subject: 'Update for: ' + pickup.kind,
        templateName: 'donor_update',
        pickup: templatePickup
      });
      done();
  });
});

agenda.define('send email', function(job, done) {
  var jobEmail = job.attrs.data;
  console.log('sending email', jobEmail);

  var headerHtml = fs.readFileSync(config.appRoot + '/views/emails/header.html', 'utf8');
  var footerHtml = fs.readFileSync(config.appRoot + '/views/emails/footer.html', 'utf8');
  var templateHtml = fs.readFileSync(config.appRoot + '/views/emails/' + jobEmail.templateName + '.html', 'utf8');
  var template = Handlebars.compile(headerHtml + templateHtml + footerHtml);
  var emailHtml = template(jobEmail);

  premailer.prepare({html: emailHtml}, function(err, email) {

    var email = new Email({
      to: jobEmail.to,
      from: 'noreply@getfeedjoy.com',
      subject: jobEmail.subject,
      html: email.html
    });
    sendgrid.send(email, function(err, json) {
      if (err) {
        console.log('Could not send email to ', email.to, ' with subject', email.subject, 'for templateName', jobEmail.templateName);
      } else {
        console.log('Sent email to ', email.to, ' with subject', email.subject, 'for templateName', jobEmail.templateName);
        console.log(json);
      }
      done();
    });
  });
});

agenda.start();
