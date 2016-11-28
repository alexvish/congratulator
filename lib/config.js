'use strict';

var extend = require('extend'),
    log = require('./log');

var config;
try {
    config = require('../service.json');
} catch(ex) {
    if (ex.code === 'MODULE_NOT_FOUND') {
        config = {};
        log.warn('Configuration file service.json is not found: using empty configuraiton');
    } else {
        throw ex;
    }
}
var defaults={
    data: {
      dir: './data',
      updateInterval: 600000
    },
    http: {
        port: 1011
    }
};

module.exports=extend(true,defaults,config);