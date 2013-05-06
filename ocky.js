/*! Ocky - v0.0.2 - 2013-05-06
* Copyright (c) 2013 Andrew Cobby <andrew.cobby@gmail.com>; Licensed BSD */
(function(window) {
  'use strict';

  // Ocky
  // ----


  // A simple module system.
  // Provides privacy and encapsultations for modules in an application.
  var Ocky = function(moduleName, definition, parent) {
    if (!moduleName.match(/^[a-zA-Z0-9]+$/) && !parent) {
      throw new Error('Cannot create a sub-module without a parent module');
    }

    this.moduleName = moduleName;
    this.subModules = {};
    this.parent     = parent;

    if (definition && _.isFunction(definition)) {
      this.addDefinition(definition);
    }
  };

  _.extend(Ocky.prototype, {

    _processName: function(moduleNames) {
      return moduleNames.split('.');
    },

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
          // null = skip definition <- added a few lines down
          this[name] = this.subModules[name] = new Ocky(name, null, this);
        }

        submodule = this.subModules[name];
      }

      if (definition && _.isFunction(definition)) {
        submodule.addDefinition(definition, dependencies);
      }

      return submodule;
    },

    addDefinition: function(definition, dependencies) {
      var inject = [this].concat(dependencies);

      definition.apply(this, inject);
    }

  });

  window.Ocky = Ocky;

}(window));