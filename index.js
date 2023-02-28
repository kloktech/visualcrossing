var log = require('debug')('visualcrossing'),
    request = require('request'),
    util = require('util'),
    qs = require('querystring');

function VisualCrossingError (errors) {
  Error.captureStackTrace(this, VisualCrossingError);
  this.errors = errors;
}

util.inherits(VisualCrossingError, Error);

VisualCrossingError.prototype.toString = function toString (){
  return "VisualCrossingError: " + this.errors;
}

function VisualCrossing (options) {
  if ( ! options) throw new VisualCrossingError('APIKey must be set on VisualCrossing options');
  if ( ! options.APIKey) throw new VisualCrossingError('APIKey must be set on VisualCrossing options');
  this.APIKey = options.APIKey;
  this.requestTimeout = options.timeout || 2500
  this.url = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
}


VisualCrossing.prototype.buildUrl = function buildUrl (latitude, longitude, time, options) {

 if (typeof time === 'object') {
    options = time;
    delete time;
 }

  var query = '?' + qs.stringify(options);
  var url = this.url + latitude + ',' + longitude;

  if ((typeof time === 'number')||(typeof time === 'string')) {
    url += ',' + time;
  }

  url += query;

  log('get ' + url);
  return url;
}

VisualCrossing.prototype.get = function get (latitude, longitude, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var url = this.buildUrl(latitude, longitude, options);

  request.get({uri:url, timeout:this.requestTimeout}, function (err, res, data) {
    if (err) {
      callback(err);
    } else if(res.headers['content-type'].indexOf('application/json') > -1) {
      callback(null, res, JSON.parse(data));
    } else if(res.statusCode === 200) {
      callback(null, res, data);
    } else {
      callback(new VisualCrossingError(data), res, data);
    }
  });
};

VisualCrossing.prototype.getAtTime = function getAtTime (latitude, longitude, time, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var url = this.buildUrl(latitude, longitude, time, options);

  request.get({uri:url, timeout:this.requestTimeout}, function (err, res, data) {
    if (err) {
      callback(err);
    } else {
      data = JSON.parse(data);
      callback(null, res, data);
    }
  });
};

module.exports = VisualCrossing;
