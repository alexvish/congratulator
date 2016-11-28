'use strict';

var config = require('./config'),
    log = require('./log'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    E = require('core-error-predicates'),
    FileNotFoundErrorPredicate = E.FileNotFoundError,
    path = require('path'),
    express = require('express');

if (!fs.existsSync(config.data.dir) || !fs.lstatSync(config.data.dir).isDirectory()) {
  var error = new Error('Path to presentations is not a directory ' + config.dataDir);
  log.error(error);
  throw error;
}
var dataDir = fs.realpathSync(config.data.dir);
var data;

var updateData = function() {
  fs.readdirAsync(dataDir)
    //after filter return only directories that contain index.html
    .filter(function(filename){
      return fs.statAsync(path.join(dataDir,filename)).then(function(stat){
        if(stat.isDirectory()) {
          return fs.readdirAsync(path.join(dataDir,filename)).then(function(dirContents) {
            return dirContents.indexOf('index.html') >= 0;
          }).catch(E.FileAccessError, function() {
            return false;
          });
        } else {
          return false;
        }
      }).catch(E.FileAccessError, function() {
        return false;
      })
    }).map(function(dir) {
    return fs.readFileAsync(path.join(dataDir,dir,'presentation.json'))
      .then(function(fileContents) {
        var contents = JSON.parse(fileContents);
        return {
          name: dir,
          presentation: contents
        }
      }).catch(function(reason) {
        if (!FileNotFoundErrorPredicate(reason)) {
          log.warn('Error reading file ' + path.join(dataDir,dir,'presentation.json'), reason);
        }
        return {
          name: dir
        }
      });
  }).then(function(result) {
    data = result;
  });
};

updateData();
setInterval(updateData,config.data.updateInterval);

module.exports.register = function(app) {
  app.use('/presentation',express.static(dataDir));
  app.use('/presentation/show-data',function(req,res) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    if (!data) {
      res.sendStatus(404);
    } else {
      res.send(data);
    }
  });
  //if not found redirect to random presentation
  app.use('/presentation',function(req,res) {
    if(!data || data.length == 0) {
      res.sendStatus(404);
    }
    var randomIndex = Math.floor(Math.random()*data.length);
    res.redirect('/presentation/' + data[randomIndex].name + '/');
  });
};



