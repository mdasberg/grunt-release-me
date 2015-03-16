/*
 * grunt-release-me
 * https://github.com/mdasberg/grunt-release-me
 *
 * Copyright (c) 2015 Mischa Dasberg
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['tmp', '.repo']
        },

        // Configuration to be run (and then tested).
        releasePrepare: {
            default_options: {
                repository: 'git@bitbucket.org:mdasberg/bower_test.git',
                cwd: '.',
                wd: '.repo/my_repo',
                main: './test.js',
                files: [
                    {
                        expand: true,
                        cwd: 'packaged_code',
                        src: ['*.js']
                    }
                ]
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'releasePrepare:default_options', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};
