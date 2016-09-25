/**
@module ember
@submodule ember-htmlbars
*/

import Ember from "ember-metal/core";
import EmberError from "ember-metal/error";

export default function set(env, view, name, value) {
  if (Ember.FEATURES.isEnabled('ember-htmlbars-block-params')) {
    view._keywords[name] = value;
  } else {
    throw new EmberError(
      "You must enable the ember-htmlbars-block-params feature " +
      "flag to use the block params feature in Ember."
    );
  }
}
