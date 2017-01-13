/*
 * @blinkmobile/angular-signature-pad: v1.0.0-alpha.1
 * https://github.com/blinkmobile/angular-signature-pad#readme
 *
 * Copyright 2017 BlinkMobile
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
    global.angularSignaturePad = mod.exports;
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
    var signaturePad = void 0;

    // Set canvas initial size to fill parent element: <bm-signature-pad></bm-signature-pad>
    canvas.width = element.clientWidth;
    canvas.height = element.clientHeight;

    vm.$onDestroy = function () {
      if (signaturePad && angular.isFunction(signaturePad.off)) {
        signaturePad.off();
      }
    };
    vm.$onInit = function () {
      var opts = vm.options || {};
      var getSignature = function getSignature() {
        var _signaturePad;

        if (!signaturePad || signaturePad.isEmpty()) {
          return undefined;
        }

        signaturePad.crop = vm.crop && vm.crop();
        var args = [vm.imageType ? vm.imageType() : undefined, vm.imageEncoder ? vm.imageEncoder() : undefined];
        return (_signaturePad = signaturePad).toDataURL.apply(_signaturePad, args);
      };

      // Need to wrap the a onBegin and onEnd in an $apply to ensure a digest cycle is started
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
      var onEnd = opts.onEnd;
      opts.onEnd = wrapFunction(function () {
        vm.ngModel.$setViewValue(getSignature());
        if (angular.isFunction(onEnd)) {
          onEnd();
        }
      });

      signaturePad = new SignaturePad(canvas, opts);

      // Functions that are made available to the parent component
      if (vm.resize) {
        vm.resize({
          $fn: function $fn() {
            signaturePad.resize(element.clientWidth, element.clientHeight, vm.scaleDown && vm.scaleDown());
            vm.ngModel.$setViewValue(getSignature());
          }
        });
      }

      // Specify how the model is deemed empty
      vm.ngModel.$isEmpty = function () {
        return signaturePad.isEmpty();
      };
      // Specify how UI should be updated
      vm.ngModel.$render = function () {
        if (vm.ngModel.$viewValue) {
          var image = new Image();

          signaturePad._reset();
          image.src = vm.ngModel.$viewValue;
          image.onload = function () {
            signaturePad.drawImage(image);
          };
          signaturePad._isEmpty = false;
        } else {
          signaturePad.clear();
        }
      };
    };
  }

  var bmSignaturePadComponent = {
    template: '<canvas class="signature-pad">Your browser does not support the HTML5 canvas tag.</canvas>',
    controller: BmSignaturePadController,
    require: {
      ngModel: 'ngModel'
    },
    bindings: {
      options: '<?',
      crop: '&?',
      imageType: '&?',
      imageEncoder: '&?',
      scaleDown: '&?',
      resize: '&?'
    }
  };

  module.exports = angular.module('bmSignaturePad', []).component('bmSignaturePad', bmSignaturePadComponent);
});
