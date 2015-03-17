function Git(grunt) {

    var path = require('path');

    /**
     * Gets the sha# from the bower file.
     * @returns sha The sha#.
     */
    function getSha(cwd) {
        var dotBowerJsonPath = path.resolve(cwd + '/.bower.json');

        return grunt.file.exists(dotBowerJsonPath)
            ? grunt.file.readJSON(dotBowerJsonPath)._resolution.commit.substring(0, 7)
            : undefined;
    }

    /**
     * Gets the current version from the bower file.
     * @returns version The version
     */
    function getVersion(cwd) {
        var bowerJsonPath = path.resolve(cwd + '/bower.json');

        return grunt.file.exists(bowerJsonPath)
            ? grunt.file.readJSON(bowerJsonPath).version
            : undefined;
    }

    /**
     * Gets the new version.
     * @returns newVersion The new version.
     */
    function getNewVersion(cwd) {
        var version = getVersion(cwd),
            sha = getSha(cwd),
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

    return {
        commands: {
            /* Clone the repository into the specified directory */
            clone: function (repository, workingDirectory, done) {
                var options = {
                    cmd: 'git',
                    args: ['clone', repository, workingDirectory],
                    opts: {
                        stdio: 'inherit'
                    }
                };
                grunt.util.spawn(options, function (error, result, code) {
                    if (error !== null) {
                        grunt.fail.fatal('Could not clone repository due to previous shown error.');
                    }
                    done();
                })
            },
            addAll: function (workingDirectory, done) {
                var options = {
                    cmd: 'git',
                    args: ['--git-dir', workingDirectory + '/.git', '--work-tree', workingDirectory, 'add', '-A'],
                    opts: {
                        stdio: 'inherit'
                    }
                };
                grunt.util.spawn(options, function (error, result, code) {
                    if (error !== null) {
                        grunt.fail.fatal('Could not add pending changes due to previous show error.');
                    }
                    done();
                });
            },
            commit: function (workingDirectory, newVersion, done) {
                var options = {
                    cmd: 'git',
                    args: ['--git-dir', workingDirectory + '/.git', '--work-tree', workingDirectory, 'commit', '-m', newVersion],
                    opts: {
                        stdio: 'inherit'
                    }
                };
                grunt.util.spawn(options, function (error, result, code) {
                    if (error !== null) {
                        grunt.fail.fatal('Could not add pending changes due to previous show error.');
                    }
                    done();
                });
            },
            tag: function (workingDirectory, newVersion, done) {
                var options = {
                    cmd: 'git',
                    args: ['--git-dir', workingDirectory + '/.git', '--work-tree', workingDirectory, 'tag', newVersion],
                    opts: {
                        stdio: 'inherit'
                    }
                };
                grunt.util.spawn(options, function (error, result, code) {
                    if (error !== null) {
                        grunt.fail.fatal('Could not tag due to previous show error.');
                    }
                    done();
                });
            },
            push: function (workingDirectory, refs, done) {
                var options = {
                    cmd: 'git',
                    args: ['--git-dir', workingDirectory + '/.git', 'push', 'origin', refs],
                    opts: {
                        stdio: 'inherit'
                    }
                };
                grunt.util.spawn(options, function (error, result, code) {
                    if (error !== null) {
                        grunt.fail.fatal('Could not tag due to previous show error.');
                    }
                    done();
                });
            }
        },
        /** Utility methods. */
        utils: {
            version: function (workingDirectory) {
                return getVersion(workingDirectory);
            },
            sha: function (workingDirectory) {
                return getSha(workingDirectory);
            },
            newVersion: function (workingDirectory) {
                return getNewVersion(workingDirectory);
            }
        }

    };
}

module.exports = Git;