'use strict';

var moment = require('moment'),
    winston = require('winston');

module.exports = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        'timestamp':function(){
                return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
            }
        })
    ]
});
