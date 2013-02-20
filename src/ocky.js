(function(window) {
  'use strict';

  // Ocky
  // ----


  // A simple module system with intelligent introspecting dependency injection.
  // Provides privacy and encapsultations for modules in an application.
  var Ocky = function(moduleName, parent) {
    this.namespaces = this._processName(moduleName);
    this.moduleName = _.last(this.namespaces);
    this.subModules = {};
    this.parent       = parent;

    this.startWithParent = true;

     this._ensureParents();
  };

  _.extend(Ocky.prototype, Backbone.Events, {

    _processName: function(moduleNames) {
      return moduleNames.split('.');
    },

    // ensure that
    _ensureParents: function() {
      if (this.namespaces.length === 1) {
        return false;
      }

      if (!this.parent) {
        throw new Error('Cannot create a sub-module without a parent module');
      }

      var parents = this.namespaces.slice(-1);
    },

    module: function(name) {
      if (!_.has(this.subModules, name)) {
        this.subModules[name] = new Ocky(name);
      }

      return this.subModules[name];
    }

  });

  window.Ocky = Ocky;

}(window));