/*
 * @blinkmobile/angular-signature-pad: v1.0.1
 * https://github.com/blinkmobile/angular-signature-pad#readme
 *
 * Copyright 2018 BlinkMobile
 * Released under the MIT license
 *
 * A thin AngularJS 1.x wrapper around:
 * https://github.com/szimek/signature_pad
 */
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports', 'angular', 'signature_pad', '@blinkmobile/canvas-manipulation'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('angular'), require('signature_pad'), require('@blinkmobile/canvas-manipulation'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.angular, global.SignaturePad, global.canvasManipulation);
    global.angularSignaturePad = mod.exports;
  }
})(this, function (exports, _angular, _signature_pad, _canvasManipulation) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _angular2 = _interopRequireDefault(_angular);

  var _signature_pad2 = _interopRequireDefault(_signature_pad);

  var canvasManipulation = _interopRequireWildcard(_canvasManipulation);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  BmSignaturePadController.$inject = ['$scope', '$element', '$attrs', '$window', '$log'];

  function BmSignaturePadController($scope, $element, $attrs, $window, $log) {
    if (!_signature_pad2.default) {
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
      if (signaturePad && _angular2.default.isFunction(signaturePad.off)) {
        signaturePad.off();
      }
    };
    vm.$onInit = function () {
      var opts = vm.options || {};
      var getSignature = function getSignature() {
        if (!signaturePad || signaturePad.isEmpty()) {
          return undefined;
        }

        var args = [vm.imageType ? vm.imageType() : undefined, vm.imageEncoder ? vm.imageEncoder() : undefined];
        if (vm.crop && vm.crop()) {
          return canvasManipulation.toDataURLCropped.apply(canvasManipulation, [canvas].concat(args));
        } else {
          var _signaturePad;

          return (_signaturePad = signaturePad).toDataURL.apply(_signaturePad, args);
        }
      };

      // Need to wrap the onBegin and onEnd in an $apply to ensure a digest cycle is started
      var wrapFunction = function wrapFunction(fn) {
        if (_angular2.default.isFunction(fn)) {
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
        if (_angular2.default.isFunction(onEnd)) {
          onEnd();
        }
      });

      signaturePad = new _signature_pad2.default(canvas, opts);

      // Functions that are made available to the parent component
      if (vm.resize) {
        vm.resize({
          $fn: function $fn() {
            var width = element.clientWidth;
            var height = element.clientHeight;
            // If canvas is empty we dont need to call resize or set the model
            if (vm.ngModel.$isEmpty()) {
              canvas.width = width;
              canvas.height = height;
            } else {
              var contentPreserved = canvasManipulation.resize(canvas, width, height, vm.scaleDown && vm.scaleDown());
              if (!contentPreserved) {
                signaturePad.clear();
              }
              vm.ngModel.$setViewValue(getSignature());
            }
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
            canvasManipulation.drawImageCentered(canvas, image);
          };
          signaturePad._isEmpty = false;
        } else {
          signaturePad.clear();
        }
      };

      // Observe changes to disabled attribute if using ngDisabled
      if ($attrs.ngDisabled) {
        $attrs.$observe('disabled', function (disabled) {
          return disabled ? signaturePad.off() : signaturePad.on();
        });
      }
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

  exports.default = _angular2.default.module('bmSignaturePad', []).component('bmSignaturePad', bmSignaturePadComponent);
});
