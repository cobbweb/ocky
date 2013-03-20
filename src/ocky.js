(function(window) {
  'use strict';

  // Ocky
  // ----


  // A simple module system with intelligent introspecting dependency injection.
  // Provides privacy and encapsultations for modules in an application.
  var Ocky = function(moduleName, definition, parent) {
    if (!moduleName.match(/^[a-zA-Z0-9]+$/)) {
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

      // nested children to make
      if (names.length > 1) {
        _.each(names, function(name) {
          parent = parent.module(name);
        }, this);

        submodule = parent;
      } else if (names.length === 1) {
        // single child to make
        if (!_.has(this.subModules, name)) {
          this[name] = this.subModules[name] = new Ocky(name, null, this);
        }

        submodule = this.subModules[name];
      }

      if (definition && _.isFunction(definition)) {
        submodule.addDefinition(definition);
      }

      return submodule;
    },

    addDefinition: function(definition) {
      var params = Ocky._getDefinitionDependencies(definition);
      var inject = [];

      _.each(params, function(name, i) {
        var dep;
        if (i === 0 && name === this.moduleName) {
          dep = this;
        } else {
          dep = Ocky.resolveDependency(name);
        }

        inject.push(dep);
      }, this);

      definition.apply(this, inject);
    }

  });

  // Static methods for depenency resolution
  Ocky.dependencies = {};

  Ocky.register = function(name, object) {
    if (_.isString(name)) {
      this.dependencies[name] = object;
    } else if (_.isPlainObject(name)) {
      _.each(name, function(dep, id) {
        this.dependencies[id] = dep;
      }, this);
    }
  };

  Ocky.resolveDependency = function(name) {
    if (name in this.dependencies) {
      return this.dependencies[name];
    }

    if (name in window) {
      return window[name];
    }

    throw new Error('Could not resolve dependency for ' + name);
  };

  // Definition introspector
  
  // yoinked straight out of angular.js... thanks guys!!
  var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]+)\)/m;
  var FN_ARG_SPLIT = /\s*,\s*/; //modded this to strip whitespace
  var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

  Ocky._getDefinitionDependencies = function(definition) {
    var params = [];
    var source = definition.toString().replace(STRIP_COMMENTS, '');
    var argDelc = source.match(FN_ARGS);
    
    if (argDelc) {
      params = argDelc[1].split(FN_ARG_SPLIT);
    }

    return params;
  };

  window.Ocky = Ocky;

}(window));