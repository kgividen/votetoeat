// Karma configuration
// Generated on Fri May 15 2015 11:05:54 GMT-0600 (MDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'public/bower/angular/angular.js',
        'public/bower/angular-route/angular-route.js',
        'public/bower/angular-mocks/angular-mocks.js',
        'public/bower/angular-animate/angular-animate.js',
        'public/bower/jquery/dist/jquery.js',
        'public/bower/jquery/dist/jquery.js',
        'public/js/lib/*.js',
        'public/js/app.js',
        'public/js/route-config.js',
        'public/js/main/*.js',
        'unit-tests/' + '*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

      plugins : [
          'karma-chrome-launcher',
          'karma-firefox-launcher',
          'karma-jasmine'
      ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
