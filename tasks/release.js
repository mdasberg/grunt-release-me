'use strict';

module.exports = function (grunt) {

    var git = require('./git')(grunt),
        path = require('path'),
        glob = require("glob"),
        fs = require('fs-extra'),
        async = require('async'),
        defaults = {
            wd: '.release'
        };

    return {
        me: function (configuration, finish) {
            var bowerJSON;

            if (typeof configuration.repository === 'undefined') {
                grunt.fail.fatal('No repository has been specified.');
            }

            if (typeof configuration.cwd === 'undefined') {
                grunt.fail.fatal('No current working directory has been specified.');
            }

            if (typeof configuration.wd === 'undefined') {
                configuration.wd = defaults.wd;
                grunt.verbose.writeln(('No working directory has been defined, using default fallback [' + defaults.wd + ']').bold);
            }

            var newVersion = git.utils.newVersion(configuration.cwd, configuration.buildNumber);
            async.series({
                    // #1
                    clone: function (callback) {
                        grunt.verbose.writeln('Cloning repository [' + configuration.repository + '] to working directory [' + configuration.wd + ']');
                        git.commands.clone(configuration.repository, configuration.wd, callback);
                    },
                    // #2
                    changes: function (callback) {
                        var changes = git.utils.previousSha(configuration.wd) !== git.utils.sha(configuration.cwd);
                        callback(changes || configuration.buildNumber == undefined ? null : 'no changes detected', 200);
                    },
                    // #3
                    copy: function (callback) {
                        grunt.verbose.writeln('Copying files to working directory [' + configuration.wd + ']');
                        var globs = [];
                        if (configuration.files instanceof Array) {
                            configuration.files.forEach(function (f) {
                                globs.push({cwd: f.cwd, src: f.src});
                            });
                        } else if (configuration.files !== undefined) {
                            globs.push({cwd: configuration.files.cwd, src: configuration.files.src});
                        }

                        globs.forEach(function (g) {
                            var files = glob.sync(g.src.toString(), {cwd: g.cwd, root: '/'});
                            files.forEach(function (file) {
                                var destinationDirectory = configuration.wd;
                                var fileDirectory = path.dirname(file);
                                if (fileDirectory !== '.') {
                                    destinationDirectory = destinationDirectory + path.sep + fileDirectory;
                                }
                                fs.mkdirpSync(destinationDirectory);
                                var source = path.resolve(g.cwd, file);
                                var destination = destinationDirectory + path.sep + path.basename(file);
                                fs.copySync(source, destination, {replace: true});
                            });
                        });
                        callback(null, 200);
                    },
                    // #4
                    updateBowerJsonWithNewVersion: function (callback) {
                        grunt.verbose.writeln('Updating bower.json with new version [' + newVersion + ']');
                        var bowerJsonPath = path.resolve(configuration.cwd + '/bower.json');
                        if (grunt.file.exists(bowerJsonPath)) {
                            bowerJSON = grunt.file.readJSON(bowerJsonPath);
                            // clean the bower.json
                            delete bowerJSON.devDependencies;
                            delete bowerJSON.ignore;
                            // update version and name
                            bowerJSON.name = bowerJSON.name;
                            bowerJSON.main = configuration.main;
                            bowerJSON.version = newVersion;
                            // write bower.json
                            grunt.file.write(configuration.wd + '/bower.json', JSON.stringify(bowerJSON, undefined, 2));
                        }
                        callback(null, 200);
                    },
                    // #5
                    addAll: function (callback) {
                        grunt.verbose.writeln('Adding all files');
                        git.commands.addAll(configuration.wd, callback);
                    },
                    // #6
                    commit: function (callback) {
                        grunt.verbose.writeln('Committing all added changes');
                        git.commands.commit(configuration.wd, 'v' + newVersion, callback);
                    },
                    // #7
                    tag: function (callback) {
                        grunt.verbose.writeln('Creating tag [v' + newVersion + ']');
                        git.commands.tag(configuration.wd, 'v' + newVersion, callback);
                    },
                    // #8
                    pushMaster: function (callback) {
                        grunt.verbose.writeln('Pushing changes to branch [master]');
                        git.commands.push(configuration.wd, 'master', callback);
                    },
                    // #9
                    pushTag: function (callback) {
                        grunt.verbose.writeln('Pushing changes to branch [v' + newVersion + ']');
                        git.commands.push(configuration.wd, 'v' + newVersion, callback);
                    }
                },
                function (err, results) {
                    if (err === 'no changes detected') {
                        grunt.verbose.warn('Nothing to release');
                    } else if (err !== undefined) {
                        grunt.fail.fatal(err);
                    }
                    finish();
                });
        }
    };
};