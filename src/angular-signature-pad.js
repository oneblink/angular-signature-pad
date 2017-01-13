'use strict'

const angular = require('angular')
const SignaturePad = require('signature_pad')

BmSignaturePadController.$inject = ['$scope', '$element', '$attrs', '$window', '$log']

function BmSignaturePadController ($scope, $element, $attrs, $window, $log) {
  if (!SignaturePad) {
    $log.error('SignaturePad is required')
    return
  }
  const vm = this
  const element = $element[0]
  const canvas = element.children[0]
  let signaturePad

  // Set canvas initial size to fill parent element: <bm-signature-pad></bm-signature-pad>
  canvas.width = element.clientWidth
  canvas.height = element.clientHeight

  vm.$onDestroy = () => {
    if (signaturePad && angular.isFunction(signaturePad.off)) {
      signaturePad.off()
    }
  }
  vm.$onInit = () => {
    const opts = vm.options || {}
    const getSignature = () => {
      if (!signaturePad || signaturePad.isEmpty()) {
        return undefined
      }

      signaturePad.crop = vm.crop && vm.crop()
      const args = [
        vm.imageType ? vm.imageType() : undefined,
        vm.imageEncoder ? vm.imageEncoder() : undefined
      ]
      return signaturePad.toDataURL(...args)
    }

    // Need to wrap the a onBegin and onEnd in an $apply to ensure a digest cycle is started
    const wrapFunction = (fn) => {
      if (angular.isFunction(fn)) {
        return () => $scope.$apply(() => fn())
      }
    }
    opts.onBegin = wrapFunction(opts.onBegin)
    const onEnd = opts.onEnd
    opts.onEnd = wrapFunction(() => {
      vm.ngModel.$setViewValue(getSignature())
      if (angular.isFunction(onEnd)) {
        onEnd()
      }
    })

    signaturePad = new SignaturePad(canvas, opts)

    // Functions that are made available to the parent component
    if (vm.resize) {
      vm.resize({
        $fn: () => {
          signaturePad.resize(element.clientWidth, element.clientHeight, vm.scaleDown && vm.scaleDown())
          vm.ngModel.$setViewValue(getSignature())
        }
      })
    }

    // Specify how the model is deemed empty
    vm.ngModel.$isEmpty = () => signaturePad.isEmpty()
    // Specify how UI should be updated
    vm.ngModel.$render = () => {
      if (vm.ngModel.$viewValue) {
        var image = new Image();

        signaturePad._reset();
        image.src = vm.ngModel.$viewValue;
        image.onload = function () {
          signaturePad.drawImage(image);
        };
        signaturePad._isEmpty = false;
      } else {
        signaturePad.clear()
      }
    }

    // Observe changes to disabled attribute if using ngDisabled
    if ($attrs.ngDisabled) {
      $attrs.$observe('disabled', (disabled) => disabled ? signaturePad.off() : signaturePad.on())
    }
  }
}

const bmSignaturePadComponent = {
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
}

module.exports = angular
  .module('bmSignaturePad', [])
  .component('bmSignaturePad', bmSignaturePadComponent)
