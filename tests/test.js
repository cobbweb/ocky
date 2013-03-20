describe('Ocky', function() {
  'use strict';

  describe('constructor', function() {
    var create = function() {
      return new Ocky('MyModule.View');
    };

    var definition = sinon.spy();
    var App = new Ocky('Application', definition);

    it('should make an instance of Ocky', function() {
      expect(App).to.be.instanceof(Ocky);
    });

    it('should know the module name', function() {
      expect(App).to.have.property('moduleName', 'Application');
    });

    it('should throw an error if you make a top level module with a (dot)', function() {
      expect(create).to.throw('Cannot create a sub-module without a parent module');
    });

    it('should run the definition in the context of the module', function() {
      expect(definition).to.have.been.calledOn(App);
    });

    it('should run the definition with the module as the first arg', function() {
      expect(definition).to.have.been.calledWithExactly(App);
    });
  });

  describe('submodule creation', function() {
    var definition1 = sinon.spy();
    var definition2 = sinon.spy();

    var App = new Ocky('App');
    var Views = App.module('Views', definition1);
    var Views2 = App.module('Views', definition2);

    it('should be able to hold submodules', function() {
      expect(Views).to.be.instanceof(Ocky);
      expect(_.size(App.subModules)).to.eq(1);
    });

    it('should return an existing submodule if it exists', function() {
      expect(Views).to.eq(Views2);
    });

    it('should only run the defitions once', function() {
      expect(definition1).to.have.been.calledOnce;
      expect(definition1).to.have.been.calledOnce;
    });

    it('should run the definitions with the submodule as the context', function() {
      expect(definition1).to.have.been.calledOn(Views);
      expect(definition2).to.have.been.calledOn(Views);
    });

    it('should run the definitions with the submodule as the first arg', function() {
      expect(definition1).to.have.been.calledWithExactly(Views);
      expect(definition1).to.have.been.calledWithExactly(Views);
    });
  });

  describe('nested submodule creation', function() {
    var App = new Ocky('App');
    var Models = App.module('Domain.Models');
    var Domain = App.module('Domain');

    it('should return a reference to the bottom module', function() {
      expect(Models).to.have.property('moduleName', 'Models');
    });

    it('should return an existing submodule if it exists', function() {
      expect(Domain).to.eq(Models.parent);
    });

    describe('deepest submodule', function() {
      it('should have an empty parent module with the corrent name', function() {
        expect(Models.parent).to.have.property('moduleName', 'Domain')
      });
    });

    describe('shallow submodule', function() {
      it('should have the deepest module as a submodule', function() {
        expect(_.size(Models.parent.subModules)).to.eq(1);
        expect(Models.parent.subModules).to.have.property('Models', Models);
      });
    });
  });

  describe('submodules', function() {
    var App = new Ocky('App');
    var Views = App.module('Views');

    it('should have a reference to the parent', function() {
      expect(Views.parent).to.eq(App);
    });
  });

  describe('module definition processor', function() {
    // test functions
    var fn0 = function() {};
    var fn1 = function(test) { return test; };
    var fn2 = function(test1, test2) { return [test1, test2]; };
    var fnWithComments = function(test1 /* string */, test) { return [test1, test2]; };

    // test processors
    var di0 = Ocky._getDefinitionDependencies(fn0);
    var di1 = Ocky._getDefinitionDependencies(fn1);
    var di2 = Ocky._getDefinitionDependencies(fn2);
    var diWithComments = Ocky._getDefinitionDependencies(fnWithComments);

    it('should return an empty array if there is no parameters in the definition', function() {
      expect(di0.length).to.eq(0);
    });

    it('should match one argument in the definition', function() {
      expect(di1.length).to.eq(1);
      expect(di1[0]).to.eq('test');
    });

    it('should match multiple parameters in the definition', function() {
      expect(di2.length).to.eq(2);
      expect(di2[0]).to.eq('test1');
      expect(di2[1]).to.eq('test2');
    });

    it('should ignore comments in the parameter definition', function() {
      expect(diWithComments.length).to.eq(2);
      expect(diWithComments[0]).to.eq('test1');
      expect(diWithComments[1]).to.eq('test');
    });
  });

  describe('dependency register', function() {
    var Backbone = function() {};
    var jQuery = function() {};
    var _ = function() {};

    Ocky.register('Backbone', Backbone);
    Ocky.register({ $: jQuery, _: _ });

    after(function() {
      Ocky.dependencies = {};
    });

    it('should register a single dependency', function() {
      expect(Ocky.dependencies).to.have.property('Backbone', Backbone);
    });

    it('should register mutliple dependencies at once with a plain object', function() {
      expect(Ocky.dependencies).to.have.property('$', jQuery);
      expect(Ocky.dependencies).to.have.property('_', _);
    });
  });

  describe('dependency resolver', function() {
    window.MyGlobal = function() {};
    window.GlobalLib = function() {};
    var LocalLib = function() { return 'LocalLib'; };
    var GlobalLib = function() { return 'yay!'; };

    Ocky.register('LocalLib', LocalLib);
    Ocky.register('GlobalLib', GlobalLib);

    var resolvedLocalLib = Ocky.resolveDependency('LocalLib');
    var resolvedMyGlobal = Ocky.resolveDependency('MyGlobal');
    var resolvedGlobalLib = Ocky.resolveDependency('GlobalLib');

    it('should resolve registered dependencies', function() {
      expect(resolvedLocalLib).to.eq(LocalLib);
    });

    it('should resolve dependencies in global scope', function() {
      expect(resolvedMyGlobal).to.eq(window.MyGlobal);
    });

    it('should resolve explicitly registered dependencies first before falling back to global scope resolution', function() {
      expect(resolvedGlobalLib).to.eq(GlobalLib);
    });
  });
});