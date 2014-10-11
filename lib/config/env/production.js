'use strict';

module.exports = {
  env: 'production',
  mongo: {
    uri: process.env.MONGO_URL||
        process.env.MONGOLAB_URI ||
         process.env.MONGOHQ_URL ||
         'mongodb://localhost/fullstack'
  }
};
