'use strict';

var config = require('./config'),
  log = require('./log'),
  express = require('express'),
  http = require('http'),
  presentation = require('./presentation');

var app = express();


app.use(express.static(__dirname + '/../static'));
presentation.register(app);

var server = http.createServer(app);
server.on('error', function(error) {
  log.error('Http server error', error);
});
server.listen(config.http.port, function(err){
  if (err) {
    return log.error('Cannot start server', err);
  }
  log.info('http server started at ' + server.address().addresss + ' port ' + server.address().port );
});