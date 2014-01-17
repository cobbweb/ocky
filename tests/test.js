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
});