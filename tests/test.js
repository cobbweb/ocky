/* jshint expr:true */
describe('Ocky', function() {
  'use strict';

  describe('constructor', function() {
    var create = function() {
      return new Ocky('MyModule.View');
    };

    beforeEach(function() {
      this.definition = sinon.spy();
      sinon.spy(Ocky.prototype, 'initialize');
      this.App = new Ocky('Application', this.definition);
    });

    afterEach(function() {
      Ocky.prototype.initialize.restore();
    });

    it('should make an instance of Ocky', function() {
      expect(this.App).to.be.instanceof(Ocky);
    });

    it('should know the module name', function() {
      expect(this.App).to.have.property('moduleName', 'Application');
    });

    it('should throw an error if you make a top level module with a (dot)', function() {
      expect(create).to.throw('Cannot create a sub-module without a parent module');
    });

    it('should run the definition in the context of the module', function() {
      expect(this.definition).to.have.been.calledOn(this.App);
    });

    it('should run the definition with the module as the first arg', function() {
      expect(this.definition.args[0][0]).to.equal(this.App);
    });

    it('should execute the initialize method', function() {
      expect(Ocky.prototype.initialize).to.have.been.called;
    });
  });

  describe('submodule creation', function() {
    var definition1 = sinon.spy();
    var definition2 = sinon.spy();

    var dependency1 = function() {};
    var dependency2 = function() {};

    var App = new Ocky('App');
    var Views = App.module('Views', definition1, dependency1);
    var Views2 = App.module('Views', definition2, dependency1, dependency2);

    it('should be able to hold submodules', function() {
      expect(Views).to.be.instanceof(Ocky);
      expect(_.size(App.subModules)).to.eq(1);
    });

    it('should return an existing submodule if it exists', function() {
      expect(Views).to.eq(Views2);
    });

    it('should only run the defitions once', function() {
      expect(definition1).to.have.been.calledOnce;
      expect(definition2).to.have.been.calledOnce;
    });

    it('should run the definitions with the submodule as the context', function() {
      expect(definition1).to.have.been.calledOn(Views);
      expect(definition2).to.have.been.calledOn(Views);
    });

    it('should run the definitions with the submodule as the first arg', function() {
      expect(definition1.args[0][0]).to.eq(Views);
      expect(definition2.args[0][0]).to.eq(Views);
    });

    it('should inject one dependency after', function() {
      expect(definition1).to.have.been.calledWithExactly(Views, dependency1);
      expect(definition2).to.have.been.calledWithExactly(Views, dependency1, dependency2);
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
        expect(Models.parent).to.have.property('moduleName', 'Domain');
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

  describe('custom modules', function() {
    var CustomModuleClass = Ocky.extend();

    beforeEach(function() {
      CustomModuleClass.prototype.initialize = sinon.spy();
      this.CustomModule = new CustomModuleClass('Test');
    });

    it('should be extendable', function() {
      expect(Ocky.extend).to.have.exist;
      expect(this.CustomModule).to.be.instanceOf(CustomModuleClass);
      expect(this.CustomModule).to.be.instanceOf(Ocky);
    });

    it('should execute the initialize method', function() {
      expect(CustomModuleClass.prototype.initialize).to.have.been.called;
    });

    describe('custom module submodules', function() {
      beforeEach(function() {
        this.ChildModule = this.CustomModule.module('ChildModule');
      });

      it('should create submodules with the same class', function() {
        expect(this.ChildModule).to.be.instanceOf(CustomModuleClass);
      });
    });

    describe('setting a custom class for submodules', function() {
      var AnotherCustomModuleClass = Ocky.extend();

      beforeEach(function() {
        AnotherCustomModuleClass.prototype.initialize = sinon.spy();
        this.CustomModule.moduleClass = AnotherCustomModuleClass;
        this.AnotherChildModule = this.CustomModule.module('AnotherChildModule');
      });

      afterEach(function() {
        this.CustomModule.moduleClass = CustomModuleClass;
      });

      it('should create submodules with the custom module class', function() {
        expect(this.AnotherChildModule).to.be.instanceof(AnotherCustomModuleClass);
        expect(this.AnotherChildModule).not.to.be.instanceof(CustomModuleClass);
      });

      it('should execute the custom module class initialize', function() {
        expect(AnotherCustomModuleClass.prototype.initialize).to.have.been.called;
      });
    });
  });
});