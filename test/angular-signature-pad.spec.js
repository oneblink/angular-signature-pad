'use strict'

var SIGNATURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAMUlEQVQYV2NkYGAQYGBgqGeAgEZGBgaGBAYGhvlQgUSQQAADA8N6qEAgSAAEFKD0AwCZVgTFYGrs8QAAAABJRU5ErkJggg=='
var HTML = '<bm-signature-pad ng-model="signature" resize="resizeSignaturePad = $fn" scale-down="false"></bm-signature-pad>'

describe('bmSignaturePad', function () {
  var $ctrl
  var $scope

  beforeEach(angular.mock.module('bmSignaturePad'))
  beforeEach(angular.mock.inject(function ($compile, $rootScope) {
    $scope = $rootScope.$new()
    $scope.signature = SIGNATURE

    var element = $compile(HTML)($scope)
    $scope.$digest()
    $ctrl = element.controller('bmSignaturePad')
  }))

  it('should use ngModel.$isEmpty() to reflect the state of the signature', function () {
    expect($ctrl.ngModel.$isEmpty).toBeDefined()
    expect($ctrl.ngModel.$isEmpty()).toBe(false)

    $scope.signature = undefined
    $scope.$digest()
    expect($ctrl.ngModel.$isEmpty()).toBe(true)
  })

  it('should be call ngModel.$render() if the signature changes', function () {
    spyOn($ctrl.ngModel, '$render')
    $scope.signature = undefined
    $scope.$digest()
    expect($ctrl.ngModel.$render).toHaveBeenCalled()
  })

  it('should expose a resize function during $onInit()', function () {
    expect($scope.resizeSignaturePad).toBeDefined()
    expect($ctrl.resize).toBeDefined()

    spyOn($ctrl.ngModel, '$setViewValue')
    spyOn($ctrl, 'scaleDown')
    $scope.resizeSignaturePad()
    $scope.$digest()

    expect($ctrl.ngModel.$setViewValue).toHaveBeenCalledWith(jasmine.any(String))
    expect($ctrl.scaleDown).toHaveBeenCalled()
  })
})
