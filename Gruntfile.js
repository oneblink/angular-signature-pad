'use strict'

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    babel: {
      options: {
        plugins: [['transform-es2015-modules-umd', {
          exactGlobals: true,
          globals: {
            'signature_pad': 'SignaturePad',
            '@blinkmobile/canvas-manipulation': 'canvasManipulation'
          }
        }]],
        presets: ['es2015']
      },
      prod: {
        files: {
          'dist/angular-signature-pad.js': ['src/angular-signature-pad.js']
        }
      }
    },

    uglify: {
      prod: {
        options: {
          preserveComments: false
        },
        files: {
          'dist/angular-signature-pad.min.js': ['dist/angular-signature-pad.js']
        }
      }
    },

    banner: {
      dev: {
        options: {
          banner: `/*
 * <%= pkg.name %>: v<%= pkg.version %>
 * <%= pkg.homepage %>
 *
 * Copyright <%= grunt.template.today("yyyy") %> BlinkMobile
 * Released under the <%= pkg.license %> license
 *
 * A thin AngularJS 1.x wrapper around:
 * https://github.com/szimek/signature_pad
 */
`
        },
        files: {
          'dist/angular-signature-pad.js': ['dist/angular-signature-pad.js']
        }
      },
      prod: {
        options: {
          banner: `/*
 * <%= pkg.name %>: v<%= pkg.version %> | <%= pkg.homepage %>
 * (c) <%= grunt.template.today('yyyy') %> BlinkMobile | Released under the <%= pkg.license %> license
 */
`
        },
        files: {
          'dist/angular-signature-pad.min.js': ['dist/angular-signature-pad.min.js']
        }
      }
    }
  })

  grunt.registerMultiTask('banner', 'Add banner to files.', function () {
    const options = this.options({
      banner: ''
    })

    const banner = grunt.template.process(options.banner)

    this.files.forEach((f) => {
      let output = grunt.file.read(f.src)
      output = banner + output
      grunt.file.write(f.dest, output)
    })
  })

  grunt.loadNpmTasks('grunt-babel')
  grunt.loadNpmTasks('grunt-contrib-uglify')

  grunt.registerTask('default', [
    'babel',
    'uglify',
    'banner'
  ])
}
