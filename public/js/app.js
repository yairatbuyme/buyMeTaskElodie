var App = Ember.Application.create();


App.Task = DS.Model.extend({
    "name"       : DS.attr(),
    "done"     : DS.attr()
});

App.Router.map(function() {
    this.resource("index", {
        "path" : "/"
    });
});

var store = this.store;

store.createRecord('task', {
  name: 'task1',
  done: '1'
});
