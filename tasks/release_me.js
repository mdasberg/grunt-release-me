/*
 * grunt-release-me
 * https://github.com/mdasberg/grunt-release-me
 *
 * Copyright (c) 2015 Mischa Dasberg
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var git = require('./git')(grunt);

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

        var defaults = {
            workingDir: './.release'
        };

        var configuration = self.data;

        if (typeof configuration.repository === 'undefined') {
            grunt.fail.fatal('No repository has been defined.');
        }
        if (typeof configuration.wd === 'undefined') {
            configuration.wd = defaults.wd;
            grunt.log.warn(('No working directory has been defined, using default fallback [' + defaults.wd + ']').bold);
        }


        // #1
        git.clone(configuration.repository, configuration.wd, function () {
            async.series({
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
                            bowerJSON.name = "bower-" + bowerJSON.name;
                            bowerJSON.main = configuration.main;
                            bowerJSON.version = getNewVersion();
                            // write bower.json
                            grunt.file.write(configuration.wd + '/bower.json', JSON.stringify(bowerJSON, undefined, 2));
                            callback(null, 200);
                        }
                    }
                },
                function (err, results) {
                    finish();
                });
        });

        /**
         * Gets the sha# from the bower file.
         * @returns sha The sha#.
         */
        function getSha() {
            var dotBowerJsonPath = path.resolve(configuration.cwd + '/.bower.json');

            return grunt.file.exists(dotBowerJsonPath)
                ? grunt.file.readJSON(dotBowerJsonPath)._resolution.commit.substring(0, 7)
                : undefined;
        }

        /**
         * Gets the current version from the bower file.
         * @returns version The version
         */
        function getVersion() {
            var bowerJsonPath = path.resolve(configuration.cwd + '/bower.json');

            return grunt.file.exists(bowerJsonPath)
                ? grunt.file.readJSON(bowerJsonPath).version
                : undefined;
        }

        /**
         * Gets the new version.
         * @returns newVersion The new version.
         */
        function getNewVersion() {
            var version = getVersion(),
                sha = getSha(),
                newVersion = undefined;

            if (version && sha) {
                var semVer = version.split('.');
                var major = semVer[0];
                var minor = semVer[1];
                var build = semVer[2];
                newVersion = major + '.' + minor + '.' + ++build + '+sha.' + sha;
            }
            return newVersion;
        }
    });

    /**
     * Perform release.
     *
     * 1. add all files
     * 2. commit all files
     * 3. create tag
     * 4. push to master
     * 5. push tag to remote
     */
    grunt.registerMultiTask('releasePerform', 'Release me', function () {

    });

};
