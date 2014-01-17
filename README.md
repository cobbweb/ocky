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

```

```