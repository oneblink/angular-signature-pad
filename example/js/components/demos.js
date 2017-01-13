'use strict'

SignatureInlineController.$inject = ['$scope', '$element', '$window', '$log']

function SignatureInlineController ($scope, $element, $window, $log) {
  var vm = this
  var windowEle = angular.element($window)
  var bmSignaturePadEle = $element.find('bm-signature-pad')[0]
  vm.height = 100
  vm.crop = true
  vm.scaleDown = true
  vm.imageType = 'image/png'

  // Watch for changes to parent element's height and width to resize canvas
  $scope.$watchGroup([function () {
    return bmSignaturePadEle.clientWidth
  }, function () {
    return bmSignaturePadEle.clientHeight
  }], function (newVals, oldVals) {
    if (!angular.equals(newVals, oldVals)) {
      vm.resize()
    }
  })

  // Watch for window resize changes to trigger a $digest to resize canvas
  function resize () {
    $scope.$digest()
  }
  windowEle.on('resize', resize)
  $scope.$on('$destroy', function () {
    windowEle.off('resize', resize)
  })
}

SignaturePopupController.$inject = ['$scope', '$element', '$window', '$log']

function SignaturePopupController ($scope, $element, $window, $log) {
  var vm = this
  var windowEle = angular.element($window)
  var popupEle = $element.find('div')

  // Watch for window resize changes to resize canvas
  function resize () {
    if (!popupEle.hasClass('ng-hide')) {
      vm.resize()
    }
  }
  windowEle.on('resize', resize)
  $scope.$on('$destroy', function () {
    windowEle.off('resize', resize)
  })
}

var signatureInlineComponent = {
  templateUrl: 'js/components/inline.html',
  controller: SignatureInlineController
}

var signaturePopupComponent = {
  templateUrl: 'js/components/popup.html',
  controller: SignaturePopupController
}

angular
  .module('signatureDemo', ['bmSignaturePad'])
  .component('signatureInline', signatureInlineComponent)
  .component('signaturePopup', signaturePopupComponent)
