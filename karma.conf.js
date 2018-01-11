// Karma configuration
// Generated on Wed Sep 16 2015 12:17:06 GMT+0100 (WEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'browserify'],

    files: [
      'test/**/*.spec.js',
      {pattern: 'test/resources/*.*', watched: false, included: false, served: true, nocache: false}
    ],

    exclude: [
      'test/**/Sandbox*.spec.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/**/*.js': ['browserify'],
      'src/**/*.js': ['browserify']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'html'],

    // customDebugFile: './test/units.html',

    // customContextFile: './test/units.html',

    specReporter: {
      maxLogLines: 5,             // limit number of lines logged per test
      suppressErrorSummary: false, // do not print error summary
      suppressFailed: false,      // do not print information about failed tests
      suppressPassed: false,      // do not print information about passed tests
      suppressSkipped: false,      // do not print information about skipped tests
      showSpecTiming: true,      // print the time elapsed for each spec
      failFast: false              // test would finish with error when a first fail occurs.
    },

    // the default configuration
    htmlReporter: {
      outputFile: 'test/units.html',

      // Optional
      pageTitle: 'Unit Tests',
      subPageTitle: 'reThink Project performance tests',
      groupSuites: true,
      useCompactStyle: true,
      useLegacyStyle: true
    },

    plugins: ['karma-spec-reporter',
      'karma-browserify',
      'karma-mocha',
      'karma-chai',
      'karma-sinon',
      'karma-htmlfile-reporter',
      'karma-mocha-reporter',
      'karma-chrome-launcher'],

    // customDebugFile: './test/units.html',

    // customContextFile: './test/units.html',

    client: {
      mocha: {
        reporter: 'html'
      },
      captureConsole: true
    },

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

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    browserify: {
      debug: true,
      extensions: ['js'],
      transform: [['babelify', {presets: ['es2015']}]]
    },

    proxies: {
      '/context-service.js': '/base/test/resources/context-service.js'
    },

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeTravis'],

    customLaunchers: {
      ChromeTravis: {
        base: 'Chrome',
        flags: [
          '--disable-web-security',
          '--ignore-certificate-errors'
        ]
      }
    }
  });
};
