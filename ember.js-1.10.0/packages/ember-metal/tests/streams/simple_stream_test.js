import Stream from "ember-metal/streams/stream";
import SimpleStream from "ember-metal/streams/simple";

var source, value;

QUnit.module('Simple Stream', {
  setup: function() {
    value = "zlurp";

    source = new Stream(function() {
      return value;
    });

    source.setValue = function(_value) {
      value = _value;
      this.notify();
    };
  },
  teardown: function() {
    value = undefined;
    source = undefined;
  }
});

test('supports a stream argument', function() {
  var stream = new SimpleStream(source);
  equal(stream.value(), "zlurp");

  stream.setValue("blorg");
  equal(stream.value(), "blorg");
});

test('supports a non-stream argument', function() {
  var stream = new SimpleStream(value);
  equal(stream.value(), "zlurp");

  stream.setValue("blorg");
  equal(stream.value(), "zlurp");
});
