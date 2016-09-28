/* global Ember */
App = Ember.Application.create();


App.Router.map(function () {
    this.resource('tasks', { path: '/' });
    this.resource('newTask', { path: '/newTask' });
});


App.TasksRoute = Ember.Route.extend({

    model: function () {
         return $.getJSON('/tasks');
    },


});

App.TasksController = Ember.ObjectController.extend({

    total: function () {
        var tasks = this.get('tasks');
        return tasks.length;
    }.property('total', 'tasks'),

});

