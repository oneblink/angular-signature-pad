# blinkmobile / angular-signature-pad [![npm](https://img.shields.io/npm/v/@blinkmobile/angular-signature-pad.svg?maxAge=2592000)](https://www.npmjs.com/package/@blinkmobile/angular-signature-pad) [![AppVeyor Status](https://img.shields.io/appveyor/ci/blinkmobile/angular-signature-pad/master.svg)](https://ci.appveyor.com/project/blinkmobile/angular-signature-pad) [![Travis CI Status](https://travis-ci.org/blinkmobile/angular-signature-pad.svg?branch=master)](https://travis-ci.org/blinkmobile/angular-signature-pad) [![Greenkeeper badge](https://badges.greenkeeper.io/blinkmobile/angular-signature-pad.svg)](https://greenkeeper.io/)

AngularJS 1.x component for smooth canvas based signature drawing

_This component does not apply any styling, it only places the canvas
and allows you to bind your component to the signature pad by exposing
the functionality provided by [signature_pad](https://github.com/szimek/signature_pad).
This means you must execute the exposed functions from your own buttons, events etc..._

## Installation

1.  Install this module, [canvas-manipulation](https://github.com/blinkmobile/canvas-manipulation) and [signature_pad](https://github.com/szimek/signature_pad) using npm

    ```
    npm install @blinkmobile/angular-signature-pad @blinkmobile/canvas-manipulation@1.x signature_pad@1.x --save
    ```

1.  Add the module to your app

    ```js
    angular.module('app', [
      'bmSignaturePad',
    ]);
    ```

1.  Ensure these three modules are loaded e.g.

    ```html
    <!DOCTYPE html>
    <html ng-app="app">
    <head>
      <script src="node_modules/signature_pad/dist/signature_pad.js"></script>
      <script src="node_modules/@blinkmobile/canvas-manipulation/dist/canvas-manipulation.js"></script>
      <script src="node_modules/@blinkmobile/angular-signature-pad/dist/angular-signature-pad.js"></script>
    </head>
    <body>
      ...
    </body>
    </html>
    ```

## Usage

### Basics

```html
<!--
  Note the use of CSS to manage the width and height of the component
  instead of managing the width and height of the canvas element
-->
<bm-signature-pad ng-model="$ctrl.signature" style="width:100%;height:100px"></bm-signature-pad>

<button ng-click="$ctrl.signature = undefined">Clear</button>

<img ng-show="$ctrl.signature"
     ng-src="{{ $ctrl.signature }}"></img>
```

### Attributes

_All attributes are optional with the exception of ngModel_

Attribute       |Value       |Comments
----------------|------------|--------
`ng-model`      |String      |Reference to bind value of signature pad to. When `ngModel` is set, `crop`, `image-type` and `image-encoder` attribute values will be used. `ngModel` is set to a [DataUrl](https://developer.mozilla.org/en-US/docs/Web/HTTP/BasURIs).<br>Will be set to `undefined` if the canvas is empty<br>If the value of the `crop` attribute is truthy, the signature will be cropped of white space before generating a DataUrl<br>Otherwise the DataUrl will contain the entire canvas
`options`       |Object      |All [signature_pad options](https://github.com/szimek/signature_pad#options) are valid.
`crop`          |Expression  |Return a truthy value if the signature should be cropped of white space when `ngModel` is set.
`image-type`    |Expression  |Return an image type to use when `ngModel` is set. See [HTMLCanvasElement.toDataUrl() type parameter](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL#Parameters) for options and default
`image-encoder` |Expression  |Return an image encoder to use when `ngModel` is set. See [HTMLCanvasElement.toDataUrl() encoderOptions parameter](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL#Parameters) for options and default
`scale-down`    |Expression  |Return a truthy value if the signature should be scaled down when calling the function exposed via `resize`.
`resize`        |Expression  |Exposes the `resize()` function provided by _@blinkmobile/canvas-manipulation_  as `$fn`. However, the `width` and `height` will be set to width and height of the canvas' parent element and the `scaleDown` argument will be set to the value of the `scale-down` attribute.

### Recommendations

-   Use CSS to manage the `width` and `height` of the `<bm-signature-pad>` element. During intialisation, the dimensions of the `<canvas>` element will be set to the dimensions of the `<bm-signature-pad>` element. If the dimensions of `<bm-signature-pad>` element change for any reason (e.g. browser resize or orientation change on a mobile device) make use of the exposed `resize()` function which will reset the `width` and `height` attributes of the `<canvas>` element. See the [Hosted Example](https://blinkmobile.github.io/angular-signature-pad/) to see this in action. For more details regarding Canvas elements, see [Sizing The Canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#Sizing_the_canvas)

    > The displayed size of the canvas can be changed using a stylesheet. The image is scaled during rendering to fit the styled size. If your renderings seem distorted, try specifying your width and height attributes explicitly in the <canvas> attributes, and not using CSS.

-   If you would like the background of the `canvas` to be something other than transparent, use CSS to change the background instead of setting the `options.backgroundColor`. Setting this option will prevent cropping from working correctly.

## Example

-   [Hosted Example](https://blinkmobile.github.io/angular-signature-pad/)

**Note**: The examples make use of a `resize` event on the `window` object and also `$scope.$watch` a DOM element property.
Both of these practices are valid JavaScript and AngularJS, however, neither are ideal in production circumstances.

For more details on the `resize` event, see [Event Reference: resize](https://developer.mozilla.org/en-US/docs/Web/Events/resize):

> Since resize events can fire at a high rate, the event handler shouldn't execute computationally expensive operations such as DOM modifications.

For more details on `$scope.$watch` best practices, see [Scope `$watch` Performance Considerations](https://docs.angularjs.org/guide/scope#scope-watch-performance-considerations):

> Dirty checking the scope for property changes is a common operation in Angular and for this reason the dirty checking function must be efficient. Care should be taken that the dirty checking function does not do any DOM access, as DOM access is orders of magnitude slower than property access on JavaScript object.

### Running Example Locally

1.  Install [Node 6.x](https://nodejs.org/en/download/) or higher

1.  Clone this repository

    **Note**: The master branch can contain undocumented or backward compatibility breaking changes. You should checkout the latest release before running the demo.

1.  Install dependencies

    ```
    npm install
    ```

1.  Start demo

    ```
    npm start
    ```

1.  Open [http://localhost:8080/docs/](http://localhost:8080/docs/) in your browser
