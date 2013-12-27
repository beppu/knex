// fluent-chain.js

// A helper for creating nicely chained API's in Javascript
// (c) 2013 - Tim Griesser
// License: MIT
// -----------------

// Create a linked list of function calls, for lazy evaluation
// and partial application of chained function calls.
var FluentChain = function() {};

// If we want to start off by chaining.
FluentChain.chain = function() {
  return new this().chain();
};

// Chain is used in cases where we do want to be mutating the
// internal state of the builder, rather than just chaining
// new objects.
FluentChain.prototype.chain = function() {
  this._chaining = true;
  return this;
};

// Breaks the current "chain".
FluentChain.prototype.unchain = function() {
  this._chaining = false;
  return this;
};

FluentChain.prototype.clone = function() {
  return new this.constructor(this.stack.slice());
};

// Add the method to the "FluentChain" object, as both
function fluentMethod(Chain, method) {
  Chain[method] =
  Chain.prototype[method] = function() {
    var args = [], arr = new Array(arguments.length);
    for (var i = 0, l = arr.length; i < l; i++) {
      args[i] = arguments[i];
    }
    return pushMethod(this, {method: method, args: args});
  };
}

// Adds a method to the stack.
function pushMethod(ctx, obj) {
  if (ctx instanceof FluentChain) {
    if (ctx._chaining) {
      ctx.stack.push(obj);
      return ctx;
    }
    return new ctx.constructor(ctx.stack.concat(obj));
  }
  return new ctx([obj]);
}

var hasProp = Object.prototype.hasOwnProperty;

// Placeholder constructor for creating the prototype chain.
function ctor() {}

// Create a new "chain" object, binding the appropriate methods.
FluentChain.create = function(methods) {
  var parent = this;
  function Chain(stack) {
    if (!(this instanceof FluentChain)) {
      return new this(stack);
    }
    this.stack = stack || [];
  }
  for (var key in parent) {
    if (hasProp.call(parent, key)) {
      Chain[key] = parent[key];
    }
  }
  ctor.prototype  = parent.prototype;
  Chain.prototype = new ctor();
  Chain.prototype.constructor = Chain;
  for (var i = 0, l = methods.length; i < l; i++) {
    fluentMethod(Chain, methods[i]);
  }
  return Chain;
};

module.exports = FluentChain;