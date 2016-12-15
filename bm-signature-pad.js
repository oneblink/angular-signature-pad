/*
 * @blinkmobile/angular-signature-pad: v1.0.0-alpha.1
 * https://github.com/blinkmobile/angular-signature-pad#readme
 *
 * Copyright 2016 BlinkMobile
 * Released under the MIT license
 *
 * A thin AngularJS 1.x wrapper around:
 * https://github.com/szimek/signature_pad
 */
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module', 'angular', 'signature_pad'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, require('angular'), require('signature_pad'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, global.angular, global.SignaturePad);
    global.bmSignaturePad = mod.exports;
  }
})(this, function (module, angular, SignaturePad) {
  'use strict';

  BmSignaturePadController.$inject = ['$scope', '$element', '$window', '$log'];

  function BmSignaturePadController($scope, $element, $window, $log) {
    if (!SignaturePad) {
      $log.error('SignaturePad is required');
      return;
    }
    var vm = this;
    var element = $element[0];
    var canvas = element.children[0];

    // Set canvas initial size to the fill parent element: <bm-signature-pad></bm-signature-pad>
    canvas.width = element.clientWidth;
    canvas.height = element.clientHeight;

    vm.$onInit = function () {
      var opts = vm.options || {};

      // Allow onBegin and onEnd to be set from the options attribute
      // but override if specified from specific attributes
      if (vm.beforeDraw) {
        opts.onBegin = vm.beforeDraw;
      }
      if (vm.afterDraw) {
        opts.onEnd = vm.afterDraw;
      }

      // Need to wrap the a few things in an $apply to ensure a digest cycle is started
      var wrapFunction = function wrapFunction(fn) {
        if (angular.isFunction(fn)) {
          return function () {
            return $scope.$apply(function () {
              return fn();
            });
          };
        }
      };
      opts.onBegin = wrapFunction(opts.onBegin);
      opts.onEnd = wrapFunction(opts.onEnd);
      opts.initValueCallback = wrapFunction(opts.initValueCallback);

      var signaturePad = new SignaturePad(canvas, opts);

      // Functions that are made available to the parent component
      if (vm.clear) {
        vm.clear({
          $fn: function $fn() {
            return signaturePad.clear();
          }
        });
      }
      if (vm.undo) {
        vm.undo({
          $fn: function $fn() {
            return signaturePad.undo();
          }
        });
      }
      if (vm.resize) {
        vm.resize({
          $fn: function $fn() {
            return signaturePad.resize(element.clientWidth, element.clientHeight, vm.scaleDown && vm.scaleDown());
          }
        });
      }
      if (vm.getSignature) {
        vm.getSignature({
          $fn: function $fn() {
            if (signaturePad.isEmpty()) {
              return undefined;
            } else if (vm.crop && vm.crop()) {
              return signaturePad.toDataURLCropped.apply(signaturePad, arguments);
            } else {
              return signaturePad.toDataURL.apply(signaturePad, arguments);
            }
          }
        });
      }
    };
  }

  var bmSignaturePadComponent = {
    template: '<canvas class="signature-pad">Your browser does not support the HTML5 canvas tag.</canvas>',
    controller: BmSignaturePadController,
    bindings: {
      options: '<?',
      beforeDraw: '&?',
      afterDraw: '&?',
      crop: '&?',
      scaleDown: '&?',
      undo: '&?',
      clear: '&?',
      resize: '&?',
      getSignature: '&?'
    }
  };

  module.exports = angular.module('bmSignaturePad', []).component('bmSignaturePad', bmSignaturePadComponent);
});
