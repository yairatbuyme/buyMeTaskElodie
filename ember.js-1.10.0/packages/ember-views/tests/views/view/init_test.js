import Ember from "ember-metal/core";
import { get } from "ember-metal/property_get";
import run from "ember-metal/run_loop";
import { computed } from "ember-metal/computed";
import EmberView from "ember-views/views/view";

var originalLookup = Ember.lookup;
var lookup, view;

QUnit.module("EmberView.create", {
  setup: function() {
    Ember.lookup = lookup = {};
  },
  teardown: function() {
    run(function() {
      view.destroy();
    });

    Ember.lookup = originalLookup;
  }
});

test("registers view in the global views hash using layerId for event targeted", function() {
  view = EmberView.create();
  run(function() {
    view.appendTo('#qunit-fixture');
  });
  equal(EmberView.views[get(view, 'elementId')], view, 'registers view');
});

QUnit.module("EmberView.createWithMixins");

test("should warn if a computed property is used for classNames", function() {
  expectAssertion(function() {
    EmberView.createWithMixins({
      elementId: 'test',
      classNames: computed(function() {
        return ['className'];
      }).volatile()
    });
  }, /Only arrays of static class strings.*For dynamic classes/i);
});

test("should warn if a non-array is used for classNameBindings", function() {
  expectAssertion(function() {
    EmberView.createWithMixins({
      elementId: 'test',
      classNameBindings: computed(function() {
        return ['className'];
      }).volatile()
    });
  }, /Only arrays are allowed/i);
});
