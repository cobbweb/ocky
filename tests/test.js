describe('Ocky', function() {

  describe('constructor', function() {
    it('should make an instance of Ocky', function() {
      expect(new Ocky('Application')).to.be.instanceof(Ocky);
    });

    it('should maintain the module name', function() {
      var MyModule = new Ocky('MyModule');
      expect(MyModule).to.have.property('moduleName', 'MyModule');
    });

    it('should throw an error if you make a top level module with a (dot)', function() {
      var create = function() {
        return new Ocky('MyModule.View');
      };

      expect(create).to.throw('Cannot create a sub-module without a parent module');
    });
  });

  describe('module', function() {
    it('should be able to hold submodules', function() {
      var App = new Ocky('App');
      var Views = App.module('Views');

      expect(Views).to.be.instanceof(Ocky);
      expect(App.subModules).to.have.length(1);
    });
  });

});