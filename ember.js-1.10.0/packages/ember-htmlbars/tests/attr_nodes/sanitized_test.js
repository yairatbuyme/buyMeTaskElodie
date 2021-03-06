/* jshint scripturl:true */

import EmberView from "ember-views/views/view";
import compile from "ember-template-compiler/system/compile";
import { SafeString } from "ember-htmlbars/utils/string";
import { runAppend, runDestroy } from "ember-runtime/tests/utils";

var view;

QUnit.module("ember-htmlbars: sanitized attribute", {
  teardown: function(){
    runDestroy(view);
  }
});

if (Ember.FEATURES.isEnabled('ember-htmlbars-attribute-syntax')) {

var badTags = [
  { tag: 'a', attr: 'href',
    unquotedTemplate: compile("<a href={{url}}></a>"),
    quotedTemplate: compile("<a href='{{url}}'></a>"),
    multipartTemplate: compile("<a href='{{protocol}}{{path}}'></a>") },
  { tag: 'body', attr: 'background',
    unquotedTemplate: compile("<body background={{url}}></body>"),
    quotedTemplate: compile("<body background='{{url}}'></body>"),
    multipartTemplate: compile("<body background='{{protocol}}{{path}}'></body>") },
  { tag: 'link', attr: 'href',
    unquotedTemplate: compile("<link href={{url}}>"),
    quotedTemplate: compile("<link href='{{url}}'>"),
    multipartTemplate: compile("<link href='{{protocol}}{{path}}'>") },
  { tag: 'img', attr: 'src',
    unquotedTemplate: compile("<img src={{url}}>"),
    quotedTemplate: compile("<img src='{{url}}'>"),
    multipartTemplate: compile("<img src='{{protocol}}{{path}}'>") },
  { tag: 'iframe', attr: 'src',
    // Setting an iframe with a bad protocol results in the browser
    // being redirected. in IE8. Skip the iframe tests on that platform.
    skip: (document.documentMode && document.documentMode <= 8),
    unquotedTemplate: compile("<iframe src={{url}}></iframe>"),
    quotedTemplate: compile("<iframe src='{{url}}'></iframe>"),
    multipartTemplate: compile("<iframe src='{{protocol}}{{path}}'></iframe>") }
];

for (var i=0, l=badTags.length; i<l; i++) {
  (function(){
    var subject = badTags[i];

    if (subject.skip) {
      return;
    }

    test(subject.tag +" "+subject.attr+" is sanitized when using blacklisted protocol", function() {
      view = EmberView.create({
        context: {url: 'javascript://example.com'},
        template: subject.unquotedTemplate
      });
      runAppend(view);

      equal( view.element.firstChild.getAttribute(subject.attr),
             "unsafe:javascript://example.com",
             "attribute is output" );
    });

    test(subject.tag +" "+subject.attr+" is sanitized when using quoted non-whitelisted protocol", function() {
      view = EmberView.create({
        context: {url: 'javascript://example.com'},
        template: subject.quotedTemplate
      });
      runAppend(view);

      equal( view.element.firstChild.getAttribute(subject.attr),
             "unsafe:javascript://example.com",
             "attribute is output" );
    });

    test(subject.tag +" "+subject.attr+" is not sanitized when using non-whitelisted protocol with a SafeString", function() {
      view = EmberView.create({
        context: {url: new SafeString('javascript://example.com')},
        template: subject.unquotedTemplate
      });

      try {
        runAppend(view);

        equal( view.element.firstChild.getAttribute(subject.attr),
               "javascript://example.com",
               "attribute is output" );
      } catch(e) {
        // IE does not allow javascript: to be set on img src
        ok(true, 'caught exception '+e);
      }
    });

    test(subject.tag+" "+subject.attr+" is sanitized when using quoted+concat non-whitelisted protocol", function() {
      view = EmberView.create({
        context: {protocol: 'javascript:', path: '//example.com'},
        template: subject.multipartTemplate
      });
      runAppend(view);

      equal( view.element.firstChild.getAttribute(subject.attr),
             "unsafe:javascript://example.com",
             "attribute is output" );
    });

  })(); //jshint ignore:line
}

}
