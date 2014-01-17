/* jshint -W106 */
(function(window) {
  'use strict';

  // Ocky
  // ----


  // A simple module system.
  // Provides privacy and encapsultations for modules in an application.
  var Ocky = function(moduleName, definition, parent) {
    if (!parent) {
      moduleName = moduleName || 'root';
      if (!moduleName.match(/^[a-zA-Z0-9]+$/)) {
        throw new Error('Cannot create a sub-module without a parent module');
      }
    }

    this.moduleName  = moduleName;
    this.subModules  = {};
    this.parent      = parent;
    this.moduleClass = this.moduleClass || this.constructor;

    this.initialize(moduleName, definition, parent);

    if (definition && _.isFunction(definition)) {
      this.addDefinition(definition);
    }
  };

  _.extend(Ocky.prototype, {

    /**
     * Empty initialize method that can be used by classes that extend Ocky
     * This is executed during module instantation, before it has any definition.
     */
    initialize: function() {},

    /**
     * Splits the full module name into namespace components
     */
    _processName: function(moduleNames) {
      return moduleNames.split('.');
    },

    /**
     * Create a submoule with an optional definition.
     * 
     * The name will automatically create namespaces so
     * you can create a module a few levels down easily.
     *
     * Additional arguments will be passed into the definition
     * function as dependencies.
     *
     * `MyModule.module('SomeChild', function(SomeChild, Marionette) {}, Backbone.Marionette);`
     */
    module: function(name, definition) {
      var names  = this._processName(name);
      var parent = this;
      var submodule;
      var dependencies = _.rest(arguments, 2);

      // nested children to make
      if (names.length > 1) {
        _.each(names, function(name) {
          parent = parent.module(name);
        }, this);

        submodule = parent;
      } else if (names.length === 1) {
        // single child to make
        if (!_.has(this.subModules, name)) {
          this[name] = this.subModules[name] = this.createSubmodule(name);
        }

        submodule = this.subModules[name];
      }

      if (definition && _.isFunction(definition)) {
        submodule.addDefinition(definition, dependencies);
      }

      return submodule;
    },

    // Initialize the submodule, including a reference to this parent module
    createSubmodule: function(name, definition) {
      var ModuleClass = this.moduleClass;
      return new ModuleClass(name, definition, this);
    },

    // Run a definition function against this module
    // You can pass an optional array of dependencies
    addDefinition: function(definition, dependencies) {
      var inject = [this].concat(dependencies);

      definition.apply(this, inject);
    }

  });

  // Extend helper (ripped from Backbone)
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  Ocky.extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
      _.extend(child.prototype, protoProps);
    }

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  window.Ocky = Ocky;

}(window));