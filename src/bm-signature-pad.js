'use strict'

const angular = require('angular')
const SignaturePad = require('signature_pad')

BmSignaturePadController.$inject = ['$scope', '$element', '$window', '$log']

function BmSignaturePadController ($scope, $element, $window, $log) {
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

      const args = [
        vm.imageType ? vm.imageType() : undefined,
        vm.imageEncoder ? vm.imageEncoder() : undefined
      ]
      if (vm.crop && vm.crop()) {
        return signaturePad.toDataURLCropped(...args)
      } else {
        return signaturePad.toDataURL(...args)
      }
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
    if (vm.clear) {
      vm.clear({
        $fn: () => {
          signaturePad.clear()
          vm.ngModel.$setViewValue(undefined)
        }
      })
    }
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
        signaturePad.fromDataURL(vm.ngModel.$viewValue)
      } else {
        signaturePad.clear()
      }
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
    clear: '&?',
    resize: '&?'
  }
}

module.exports = angular
  .module('bmSignaturePad', [])
  .component('bmSignaturePad', bmSignaturePadComponent)
