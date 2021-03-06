/**
@module ember
@submodule ember-handlebars
*/

import Ember from "ember-metal/core"; // Ember.assert
import EmberHandlebars from "ember-handlebars-compiler";

import { uuid } from "ember-metal/utils";
import { fmt } from "ember-runtime/system/string";
import { typeOf } from "ember-metal/utils";
import { forEach } from "ember-metal/array";
import View from "ember-views/views/view";
import keys from "ember-metal/keys";

import sanitizeAttributeValue from "ember-views/system/sanitize_attribute_value";

var helpers = EmberHandlebars.helpers;
var SafeString = EmberHandlebars.SafeString;

/**
  `bind-attr` allows you to create a binding between DOM element attributes and
  Ember objects. For example:

  ```handlebars
  <img {{bind-attr src="imageUrl" alt="imageTitle"}}>
  ```

  The above handlebars template will fill the `<img>`'s `src` attribute with
  the value of the property referenced with `"imageUrl"` and its `alt`
  attribute with the value of the property referenced with `"imageTitle"`.

  If the rendering context of this template is the following object:

  ```javascript
  {
    imageUrl: 'http://lolcats.info/haz-a-funny',
    imageTitle: 'A humorous image of a cat'
  }
  ```

  The resulting HTML output will be:

  ```html
  <img src="http://lolcats.info/haz-a-funny" alt="A humorous image of a cat">
  ```

  `bind-attr` cannot redeclare existing DOM element attributes. The use of `src`
  in the following `bind-attr` example will be ignored and the hard coded value
  of `src="/failwhale.gif"` will take precedence:

  ```handlebars
  <img src="/failwhale.gif" {{bind-attr src="imageUrl" alt="imageTitle"}}>
  ```

  ### `bind-attr` and the `class` attribute

  `bind-attr` supports a special syntax for handling a number of cases unique
  to the `class` DOM element attribute. The `class` attribute combines
  multiple discrete values into a single attribute as a space-delimited
  list of strings. Each string can be:

  * a string return value of an object's property.
  * a boolean return value of an object's property
  * a hard-coded value

  A string return value works identically to other uses of `bind-attr`. The
  return value of the property will become the value of the attribute. For
  example, the following view and template:

  ```javascript
    AView = View.extend({
      someProperty: function() {
        return "aValue";
      }.property()
    })
  ```

  ```handlebars
  <img {{bind-attr class="view.someProperty}}>
  ```

  Result in the following rendered output:

  ```html
  <img class="aValue">
  ```

  A boolean return value will insert a specified class name if the property
  returns `true` and remove the class name if the property returns `false`.

  A class name is provided via the syntax
  `somePropertyName:class-name-if-true`.

  ```javascript
  AView = View.extend({
    someBool: true
  })
  ```

  ```handlebars
  <img {{bind-attr class="view.someBool:class-name-if-true"}}>
  ```

  Result in the following rendered output:

  ```html
  <img class="class-name-if-true">
  ```

  An additional section of the binding can be provided if you want to
  replace the existing class instead of removing it when the boolean
  value changes:

  ```handlebars
  <img {{bind-attr class="view.someBool:class-name-if-true:class-name-if-false"}}>
  ```

  A hard-coded value can be used by prepending `:` to the desired
  class name: `:class-name-to-always-apply`.

  ```handlebars
  <img {{bind-attr class=":class-name-to-always-apply"}}>
  ```

  Results in the following rendered output:

  ```html
  <img class="class-name-to-always-apply">
  ```

  All three strategies - string return value, boolean return value, and
  hard-coded value – can be combined in a single declaration:

  ```handlebars
  <img {{bind-attr class=":class-name-to-always-apply view.someBool:class-name-if-true view.someProperty"}}>
  ```

  @method bind-attr
  @for Ember.Handlebars.helpers
  @param {Hash} options
  @return {String} HTML string
*/
function bindAttrHelper(options) {
  var attrs = options.hash;

  Ember.assert("You must specify at least one hash argument to bind-attr", !!keys(attrs).length);

  var view = options.data.view;
  var ret = [];

  // we relied on the behavior of calling without
  // context to mean this === window, but when running
  // "use strict", it's possible for this to === undefined;
  var ctx = this || window;

  // Generate a unique id for this element. This will be added as a
  // data attribute to the element so it can be looked up when
  // the bound property changes.
  var dataId = uuid();

  // Handle classes differently, as we can bind multiple classes
  var classBindings = attrs['class'];
  if (classBindings != null) {
    var classResults = bindClasses(ctx, classBindings, view, dataId, options);

    ret.push('class="' + Handlebars.Utils.escapeExpression(classResults.join(' ')) + '"');
    delete attrs['class'];
  }

  var attrKeys = keys(attrs);

  // For each attribute passed, create an observer and emit the
  // current value of the property as an attribute.
  forEach.call(attrKeys, function(attr) {
    var path = attrs[attr];

    Ember.assert(fmt("You must provide an expression as the value of bound attribute." +
                     " You specified: %@=%@", [attr, path]), typeof path === 'string');

    var lazyValue = view.getStream(path);
    var value = lazyValue.value();
    value = sanitizeAttributeValue(null, attr, value);
    var type = typeOf(value);

    Ember.assert(fmt("Attributes must be numbers, strings or booleans, not %@", [value]), 
                 value === null || value === undefined || type === 'number' || type === 'string' || type === 'boolean');

    lazyValue.subscribe(view._wrapAsScheduled(function applyAttributeBindings() {
      var result = lazyValue.value();

      Ember.assert(fmt("Attributes must be numbers, strings or booleans, not %@", [result]),
                   result === null || result === undefined || typeof result === 'number' ||
                     typeof result === 'string' || typeof result === 'boolean');

      var elem = view.$("[data-bindattr-" + dataId + "='" + dataId + "']");

      Ember.assert("An attribute binding was triggered when the element was not in the DOM", elem && elem.length !== 0);

      View.applyAttributeBindings(elem, attr, result);
    }));

    // if this changes, also change the logic in ember-views/lib/views/view.js
    if ((type === 'string' || (type === 'number' && !isNaN(value)))) {
      ret.push(attr + '="' + Handlebars.Utils.escapeExpression(value) + '"');
    } else if (value && type === 'boolean') {
      // The developer controls the attr name, so it should always be safe
      ret.push(attr + '="' + attr + '"');
    }
  }, this);

  // Add the unique identifier
  // NOTE: We use all lower-case since Firefox has problems with mixed case in SVG
  ret.push('data-bindattr-' + dataId + '="' + dataId + '"');
  return new SafeString(ret.join(' '));
}

/**
  See `bind-attr`

  @method bindAttr
  @for Ember.Handlebars.helpers
  @deprecated
  @param {Function} context
  @param {Hash} options
  @return {String} HTML string
*/
function bindAttrHelperDeprecated() {
  Ember.deprecate("The 'bindAttr' view helper is deprecated in favor of 'bind-attr'");

  return helpers['bind-attr'].apply(this, arguments);
}

/**
  Helper that, given a space-separated string of property paths and a context,
  returns an array of class names. Calling this method also has the side
  effect of setting up observers at those property paths, such that if they
  change, the correct class name will be reapplied to the DOM element.

  For example, if you pass the string "fooBar", it will first look up the
  "fooBar" value of the context. If that value is true, it will add the
  "foo-bar" class to the current element (i.e., the dasherized form of
  "fooBar"). If the value is a string, it will add that string as the class.
  Otherwise, it will not add any new class name.

  @private
  @method bindClasses
  @for Ember.Handlebars
  @param {Ember.Object} context The context from which to lookup properties
  @param {String} classBindings A string, space-separated, of class bindings
    to use
  @param {View} view The view in which observers should look for the
    element to update
  @param {Srting} bindAttrId Optional bindAttr id used to lookup elements
  @return {Array} An array of class names to add
*/
function bindClasses(context, classBindings, view, bindAttrId, options) {
  var ret = [];
  var newClass, value, elem;

  // For each property passed, loop through and setup
  // an observer.
  forEach.call(classBindings.split(' '), function(binding) {

    // Variable in which the old class value is saved. The observer function
    // closes over this variable, so it knows which string to remove when
    // the property changes.
    var oldClass;
    var parsedPath = View._parsePropertyPath(binding);
    var path = parsedPath.path;
    var initialValue;

    if (path === '') {
      initialValue = true;
    } else {
      var lazyValue = view.getStream(path);
      initialValue = lazyValue.value();

      // Set up an observer on the context. If the property changes, toggle the
      // class name.
      lazyValue.subscribe(view._wrapAsScheduled(function applyClassNameBindings() {
        // Get the current value of the property
        var value = lazyValue.value();
        newClass = classStringForParsedPath(parsedPath, value);
        elem = bindAttrId ? view.$("[data-bindattr-" + bindAttrId + "='" + bindAttrId + "']") : view.$();

        Ember.assert("A class name binding was triggered when the element was not in the DOM", elem && elem.length !== 0);

        // If we had previously added a class to the element, remove it.
        if (oldClass) {
          elem.removeClass(oldClass);
        }

        // If necessary, add a new class. Make sure we keep track of it so
        // it can be removed in the future.
        if (newClass) {
          elem.addClass(newClass);
          oldClass = newClass;
        } else {
          oldClass = null;
        }
      }));
    }

    // We've already setup the observer; now we just need to figure out the
    // correct behavior right now on the first pass through.
    value = classStringForParsedPath(parsedPath, initialValue);

    if (value) {
      ret.push(value);

      // Make sure we save the current value so that it can be removed if the
      // observer fires.
      oldClass = value;
    }
  });

  return ret;
}

function classStringForParsedPath(parsedPath, value) {
  return View._classStringForValue(parsedPath.path, value, parsedPath.className, parsedPath.falsyClassName);
}

export default bindAttrHelper;

export {
  bindAttrHelper,
  bindAttrHelperDeprecated,
  bindClasses
};
