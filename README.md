# Ocky

 > A simple javascript module system for better code organisation, based on Marionette.Module


### Usage

```js
var App = new Ocky('App');

var Customers = App.module('Customers', function(Customers, Backbone) {
  Customers.CustomerListView = Backbone.View.extend({
    className: 'customer-list'
  });
}, Backbone)
```

Ocky will automatically create deep module structures
```js
// ... continuing from above
App.Store; // undefined
App.module('Store.Products');
App.Store; // Store exists now
App.Store.Products; // Products also exists
```


#### Extending Ocky
Ocky can be extended so you can create custom module classes. Any submodules will also be created using this class.

```js
var Application = Ocky.extend({});
var MyApp = new Application('App');
MyApp.module('Models', function(Models) { /* ... */ });
```

Classes that extend Ocky can also define an `initialize` method, this is executed before definitions.

```js
var Application = Ocky.extend({
  initialize: function() {
    this.someOption = 'yolo';
  }
});

var MyApp = new Application();
MyApp.someOption; // -> 'yolo'

MyApp.module('Models', function(Models) {
  Models.someOption; // -> yolo
});
```

Obvisouly, having all submodule also created using the same custom module class isn't ideal. To get around this, you can define what class you want for your submodules.

```js
var ApplicationModule = Ocky.extend({
  initialize: function() {
    this.submoduleOption = 'swag';
  }
});

var Application = Ocky.extend({
  moduleClass: ApplicationModule,
  
  initialize: function() {
    this.appOption = 'yolo';
  }
});

var MyApp = new Application();

MyApp.appOption; // -> 'yolo'
MyApp.submoduleOption; // -> undefined

MyApp.module('Models', function(Models) {
  Models.submoduleOption // 'swag'
  Models.appOption; // -> undefined
});
```