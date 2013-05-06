# Ocky

 > A simple javascript module system

```js
var App = new Ocky('App');

var Customers = App.module('Customers', function(Customers, Backbone) {
  Customers.CustomerListView = Backbone.View.extend({
    className: 'customer-list'
  });
}, Backbone)
```