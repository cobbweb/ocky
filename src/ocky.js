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

    this.moduleName  = moduleName;
    this.subModules  = {};
    this.parent      = parent;
    this.moduleClass = this.constructor;

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
          this[name] = this.subModules[name] = this.createSubmodule(name);
        }

        submodule = this.subModules[name];
      }

      if (definition && _.isFunction(definition)) {
        submodule.addDefinition(definition, dependencies);
      }

      return submodule;
    },

    createSubmodule: function(name, definition) {
      return new Ocky(name, definition, this);
    },

    addDefinition: function(definition, dependencies) {
      var inject = [this].concat(dependencies);

      definition.apply(this, inject);
    }

  });

  window.Ocky = Ocky;

}(window));