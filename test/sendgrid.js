var sendgrid  = require('sendgrid')('thomas.devol', 'wakeandbake');
var Email     = sendgrid.Email;
var email     = new Email({
  to:       'kultiv8tor@gmail.com',
  from:     'team@getfeedjoy.com',
  subject:  'New Pickup: 20 Steaks',
  text:     'Pickup reported at 225 W Evergreen'
});
sendgrid.send(email, function(err, json) {
  if (err) { return console.error(err); }
  console.log(json);
});
