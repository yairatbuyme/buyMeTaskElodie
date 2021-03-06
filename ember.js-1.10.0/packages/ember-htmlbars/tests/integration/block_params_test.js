import Container from 'container/container';
import run from "ember-metal/run_loop";
import ComponentLookup from 'ember-views/component_lookup';
import View from "ember-views/views/view";
import compile from "ember-template-compiler/system/compile";
import helpers from "ember-htmlbars/helpers";
import { registerHelper } from "ember-htmlbars/helpers";
import { runAppend, runDestroy } from "ember-runtime/tests/utils";

var container, view;

function aliasHelper(params, hash, options, env) {
  this.appendChild(View, {
    isVirtual: true,
    _morph: options.morph,
    template: options.template,
    _blockArguments: params
  });
}

if (Ember.FEATURES.isEnabled('ember-htmlbars-block-params')) {

QUnit.module("ember-htmlbars: block params", {
  setup: function() {
    registerHelper('alias', aliasHelper);

    container = new Container();
    container.optionsForType('component', { singleton: false });
    container.optionsForType('view', { singleton: false });
    container.optionsForType('template', { instantiate: false });
    container.optionsForType('helper', { instantiate: false });
    container.register('component-lookup:main', ComponentLookup);
  },
  teardown: function() {
    delete helpers.alias;

    runDestroy(container);
    runDestroy(view);
  }
});

QUnit.test("should raise error if helper not available", function() {
  view = View.create({
    template: compile('{{#shouldfail}}{{/shouldfail}}')
  });

  expectAssertion(function() {
    runAppend(view);
  }, 'A helper named `shouldfail` could not be found');

});

QUnit.test("basic block params usage", function() {
  view = View.create({
    committer: { name: "rwjblue" },
    template: compile('{{#alias view.committer.name as |name|}}name: {{name}}, length: {{name.length}}{{/alias}}')
  });

  runAppend(view);

  equal(view.$().text(), "name: rwjblue, length: 7");

  run(function() {
    view.set('committer.name', "krisselden");
  });

  equal(view.$().text(), "name: krisselden, length: 10");
});

test("nested block params shadow correctly", function() {
  view = View.create({
    context: { name: "ebryn" },
    committer1: { name: "trek" },
    committer2: { name: "machty" },
    template: compile(
      '{{name}}' +
      '{{#alias view.committer1.name as |name|}}' +
        '[{{name}}' +
        '{{#alias view.committer2.name as |name|}}' +
          '[{{name}}]' +
        '{{/alias}}' +
        '{{name}}]' +
      '{{/alias}}' +
      '{{name}}' +
      '{{#alias view.committer2.name as |name|}}' +
        '[{{name}}' +
        '{{#alias view.committer1.name as |name|}}' +
          '[{{name}}]' +
        '{{/alias}}' +
        '{{name}}]' +
      '{{/alias}}' +
      '{{name}}'
    )
  });

  runAppend(view);

  equal(view.$().text(), "ebryn[trek[machty]trek]ebryn[machty[trek]machty]ebryn");
});

test("components can yield values", function() {
  container.register('template:components/x-alias', compile('{{yield param.name}}'));

  view = View.create({
    container: container,
    context: { name: "ebryn" },
    committer1: { name: "trek" },
    committer2: { name: "machty" },
    template: compile(
      '{{name}}' +
      '{{#x-alias param=view.committer1 as |name|}}' +
        '[{{name}}' +
        '{{#x-alias param=view.committer2 as |name|}}' +
          '[{{name}}]' +
        '{{/x-alias}}' +
        '{{name}}]' +
      '{{/x-alias}}' +
      '{{name}}' +
      '{{#x-alias param=view.committer2 as |name|}}' +
        '[{{name}}' +
        '{{#x-alias param=view.committer1 as |name|}}' +
          '[{{name}}]' +
        '{{/x-alias}}' +
        '{{name}}]' +
      '{{/x-alias}}' +
      '{{name}}'
    )
  });

  runAppend(view);

  equal(view.$().text(), "ebryn[trek[machty]trek]ebryn[machty[trek]machty]ebryn");
});

}
