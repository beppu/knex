// ClientBase
// ----------
var Helpers = require('../lib/helpers');

// The `ClientBase` is assumed as the object that all database `clients`
// inherit from, and is used in an `instanceof` check when initializing the
// library. If you wish to write or customize an adapter, just inherit from
// this base, with `ClientBase.extend`, and you're good to go.
var ClientBase = module.exports = function() {};

// Grab the standard `Object.extend` as popularized by Backbone.js.
ClientBase.extend = require('simple-extend');