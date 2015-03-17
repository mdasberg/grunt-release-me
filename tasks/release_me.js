/*
 * grunt-release-me
 * https://github.com/mdasberg/grunt-release-me
 *
 * Copyright (c) 2015 Mischa Dasberg
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var git = require('./git')(grunt),
        path = require('path');

    var defaults = {
        workingDir: './.release'
    };

    /**
     * Prepare release.
     *
     * 1. clone the repository
     * 2. copy the specified files to the release repository
     * 3. update the bower.json file with the correct new version
     */
    grunt.registerMultiTask('releasePrepare', 'Release me', function () {

        var path = require('path'),
            async = require('async'),
            finish = this.async(),
            self = this,
            bowerJSON;

        var configuration = self.data;

        if (typeof configuration.repository === 'undefined') {
            grunt.fail.fatal('No repository has been defined.');
        }
        if (typeof configuration.wd === 'undefined') {
            configuration.wd = defaults.wd;
            grunt.log.warn(('No working directory has been defined, using default fallback [' + defaults.wd + ']').bold);
        }

        async.series({
                // #1
                clone: function (callback) {
                    git.commands.clone(configuration.repository, configuration.wd, callback);
                },
                // #2
                copy: function (callback) {
                    var copyConfig = {release: undefined};
                    if (configuration.files instanceof Array) {
                        copyConfig.release = {files: []};
                        for (var i in configuration.files) {
                            var f = configuration.files[i];
                            f.dest = configuration.wd; // set the destination.
                            copyConfig.release.files.push(f);
                        }
                    } else {
                        copyConfig.release = configuration.files;
                        copyConfig.release.dest = configuration.wd;
                    }
                    grunt.config.set('copy', copyConfig);
                    grunt.task.run('copy');
                    callback(null, 200);
                },
                // #3
                updateBowerJsonWithNewVersion: function (callback) {
                    var bowerJsonPath = path.resolve(configuration.cwd + '/bower.json');
                    if (grunt.file.exists(bowerJsonPath)) {
                        bowerJSON = grunt.file.readJSON(bowerJsonPath);
                        // clean the bower.json
                        delete bowerJSON.devDependencies;
                        delete bowerJSON.ignore;
                        // update version and name
                        bowerJSON.name = bowerJSON.name;
                        bowerJSON.main = configuration.main;
                        bowerJSON.version = git.utils.newVersion(configuration.cwd);
                        // write bower.json
                        grunt.file.write(configuration.wd + '/bower.json', JSON.stringify(bowerJSON, undefined, 2));
                    }
                    callback(null, 200);
                }
            },
            function (err, results) {
                finish();
            });


    });

    /**
     * Perform release.
     *
     * 1. add all changes
     * 2. commit all added changes
     * 3. create tag
     * 4. push to master
     * 5. push tag to remote
     */
    grunt.registerMultiTask('releasePerform', 'Release me', function () {

        var path = require('path'),
            async = require('async'),
            finish = this.async(),
            self = this;

        var configuration = self.data;

        if (typeof configuration.wd === 'undefined') {
            configuration.wd = defaults.wd;
            grunt.log.warn(('No working directory has been defined, using default fallback [' + defaults.wd + ']').bold);
        }

        var newVersion = 'v' + git.utils.newVersion(configuration.cwd);
        async.series({
                // #1
                addAll: function (callback) {
                    git.commands.addAll(configuration.wd, callback);
                },
                // #2
                commit: function (callback) {
                    git.commands.commit(configuration.wd, newVersion, callback);
                },
                // #3
                tag: function(callback) {
                    git.commands.tag(configuration.wd, newVersion, callback);
                },
                // #4
                pushMaster: function(callback) {
                    git.commands.push(configuration.wd, 'master', callback);
                },
                // #5
                pushTag: function(callback) {
                    git.commands.push(configuration.wd, newVersion, callback);
                }
            },
            function (err, results) {
                finish();
            });
    });

};
