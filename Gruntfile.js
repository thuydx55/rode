var index = require('./index');

module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-mocha-test');

  // Project configuration.
  grunt.initConfig({
    // Configure a mochaTest task
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: [
          'src/**/Tests/**/*.js'
        ]
      }
    }
  });

  // Run tests //
  grunt.registerTask('test', [
    'mochaTest'
  ]);

  // Build tasks //
  grunt.registerTask('build', [

  ]);

  // Default tasks //
  grunt.registerTask('default', [
    'test',
    'build'
  ]);
};