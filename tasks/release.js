module.exports = function (grunt) {

    var git = require('./git')(grunt),
        path = require('path'),
        glob = require("glob"),
        fs = require('fs-extra'),
        async = require('async'),
        defaults = {
            workingDir: './.release'
        };

    return {
        releaseMe: function (configuration, finish) {
            var bowerJSON;

            if (typeof configuration.repository === 'undefined') {
                grunt.fail.fatal('No repository has been specified.');
            }

            if (typeof configuration.buildNumber === 'undefined') {
                grunt.fail.fatal('No buildNumber has been specified.');
            }

            if (typeof configuration.wd === 'undefined') {
                configuration.wd = defaults.wd;
                grunt.log.warn(('No working directory has been defined, using default fallback [' + defaults.wd + ']').bold);
            }

            var newVersion = git.utils.newVersion(configuration.cwd, configuration.buildNumber);
            async.series({
                    // #1
                    clone: function (callback) {
                        git.commands.clone(configuration.repository, configuration.wd, callback);
                    },
                    // #2
                    copy: function (callback) {
                        var globs = [];
                        if (configuration.files instanceof Array) {
                            configuration.files.forEach(function (f) {
                                globs.push({cwd: f.cwd, src: f.src});
                            });
                        } else {
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
                    // #3
                    updateBowerJsonWithNewVersion: function (callback) {
                        console.log('updateBowerJsonWithNewVersion')
                        var bowerJsonPath = path.resolve(configuration.cwd + '/bower.json');
                        if (grunt.file.exists(bowerJsonPath)) {
                            bowerJSON = grunt.file.readJSON(bowerJsonPath);
                            // clean the bower.json
                            delete bowerJSON.devDependencies;
                            delete bowerJSON.ignore;
                            // update version and name
                            bowerJSON.name = bowerJSON.name;
                            bowerJSON.main = configuration.main;
                            bowerJSON.version = newVersion
                            // write bower.json
                            grunt.file.write(configuration.wd + '/bower.json', JSON.stringify(bowerJSON, undefined, 2));
                        }
                        callback(null, 200);
                    },
                    // #4
                    addAll: function (callback) {
                        git.commands.addAll(configuration.wd, callback);
                    },
                    // #5
                    commit: function (callback) {
                        git.commands.commit(configuration.wd, 'v' + newVersion, callback);
                    },
                    // #6
                    tag: function (callback) {
                        git.commands.tag(configuration.wd, 'v' + newVersion, callback);
                    },
                    // #7
                    pushMaster: function (callback) {
                        git.commands.push(configuration.wd, 'master', callback);
                    },
                    // #8
                    pushTag: function (callback) {
                        git.commands.push(configuration.wd, 'v' + newVersion, callback);
                    }
                },
                function (err, results) {
                    if(err !== undefined) {
                        grunt.fail.fatal(err);
                    }
                    finish();
                });
        }
    };
};