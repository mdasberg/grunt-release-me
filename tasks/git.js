'use strict';

function Git(grunt) {

    var path = require('path');

    /**
     * Gets the sha# from the bower file.
     * @returns string The sha#.
     */
    function getSha(cwd) {
        var dotBowerJsonPath = path.resolve(cwd, '.bower.json'),
            gitHeadPath = path.resolve(cwd, '.git', 'HEAD');

        // first check .bower.json
        if(grunt.file.exists(dotBowerJsonPath)) {
            return grunt.file.readJSON(dotBowerJsonPath)._resolution.commit.substring(0, 7);
        // then check .git/HEAD
        } else if(grunt.file.exists(gitHeadPath)) {
            var head = /^ref:\s*(.+)\n*$/.exec(grunt.file.read(gitHeadPath));
            if(head !== null) {
                return grunt.file.read(path.resolve(cwd, '.git', head[1])).substring(0, 7);
            }

            return undefined;
        }
        // unable to determine SHA of revision
        return undefined;
    }

    /**
     * Gets the current version from the bower file.
     * @returns version The version
     */
    function getVersion(cwd) {
        var bowerJsonPath = path.resolve(cwd + '/bower.json');

        return grunt.file.exists(bowerJsonPath)?
            grunt.file.readJSON(bowerJsonPath).version.match(/([\d|\.]+)/)[1]:
            undefined;
    }

    /**
     * Gets the previous sha from the bower file from the repository.
     * @returns sha The sha
     */
    function getPreviousSha(wd) {
        var bowerJsonPath = path.resolve(wd + '/bower.json');
        if(grunt.file.exists(bowerJsonPath)) {
            var sha;
            try {
                sha = grunt.file.readJSON(bowerJsonPath).version.match(/.*sha\.(.*)/)[1];
            } finally {
                return sha;
            }
        }
    }

    /**
     * Gets the new version.
     * @returns newVersion The new version.
     */
    function getNewVersion(cwd, buildNumber) {
        var buildNo = parseInt(buildNumber),
            version = getVersion(cwd),
            sha = getSha(cwd),
            newVersion;

        if(isNaN(buildNo)) {
            buildNo = undefined;
        }

        if(version) {
            newVersion = version;
            if(buildNo && sha) {
                newVersion = newVersion.concat('-build.' + buildNo + '+sha.' + sha);
            }
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
                });
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
            previousSha: function (workingDirectory) {
                return getPreviousSha(workingDirectory);
            },
            newVersion: function (workingDirectory, buildNumber) {
                return getNewVersion(workingDirectory, buildNumber);
            }
        }
    };
}

module.exports = Git;