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

  // Set canvas initial size to the fill parent element: <bm-signature-pad></bm-signature-pad>
  canvas.width = element.clientWidth
  canvas.height = element.clientHeight

  vm.$onInit = () => {
    const opts = vm.options || {}

    // Allow onBegin and onEnd to be set from the options attribute
    // but override if specified from specific attributes
    if (vm.beforeDraw) {
      opts.onBegin = vm.beforeDraw
    }
    if (vm.afterDraw) {
      opts.onEnd = vm.afterDraw
    }

    // Need to wrap the a few things in an $apply to ensure a digest cycle is started
    const wrapFunction = (fn) => {
      if (angular.isFunction(fn)) {
        return () => $scope.$apply(() => fn())
      }
    }
    opts.onBegin = wrapFunction(opts.onBegin)
    opts.onEnd = wrapFunction(opts.onEnd)
    opts.initValueCallback = wrapFunction(opts.initValueCallback)

    const signaturePad = new SignaturePad(canvas, opts)

    // Functions that are made available to the parent component
    if (vm.clear) {
      vm.clear({
        $fn: () => signaturePad.clear()
      })
    }
    if (vm.resize) {
      vm.resize({
        $fn: () => signaturePad.resize(element.clientWidth, element.clientHeight, vm.scaleDown && vm.scaleDown())
      })
    }
    if (vm.getSignature) {
      vm.getSignature({
        $fn: (...args) => {
          if (signaturePad.isEmpty()) {
            return undefined
          } else if (vm.crop && vm.crop()) {
            return signaturePad.toDataURLCropped(...args)
          } else {
            return signaturePad.toDataURL(...args)
          }
        }
      })
    }
  }
}

const bmSignaturePadComponent = {
  template: '<canvas class="signature-pad">Your browser does not support the HTML5 canvas tag.</canvas>',
  controller: BmSignaturePadController,
  bindings: {
    options: '<?',
    beforeDraw: '&?',
    afterDraw: '&?',
    crop: '&?',
    scaleDown: '&?',
    clear: '&?',
    resize: '&?',
    getSignature: '&?'
  }
}

module.exports = angular
  .module('bmSignaturePad', [])
  .component('bmSignaturePad', bmSignaturePadComponent)
