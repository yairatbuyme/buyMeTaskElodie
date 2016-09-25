/**
@module ember
@submodule ember-htmlbars
*/

import AttrNode from "./attr_node";
import { fmt } from "ember-runtime/system/string";
import { typeOf } from "ember-metal/utils";
import { read } from "ember-metal/streams/utils";
import create from 'ember-metal/platform/create';

function LegacyBindAttrNode(attrName, attrValue) {
  this.init(attrName, attrValue);
}

LegacyBindAttrNode.prototype = create(AttrNode.prototype);

LegacyBindAttrNode.prototype.render = function render(buffer) {
  this.isDirty = false;
  var value = read(this.attrValue);
  var type = typeOf(value);

  Ember.assert(fmt("Attributes must be numbers, strings or booleans, not %@", [value]),
               value === null || value === undefined || type === 'number' || type === 'string' || type === 'boolean');

  this._morph.setContent(value);

  this.lastValue = value;
};

export default LegacyBindAttrNode;

