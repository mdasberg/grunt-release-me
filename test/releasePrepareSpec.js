'use strict';

var grunt = require('grunt'),
    release;

/**
 * Tests for the Release Me grunt plugin.
 */
describe('ReleaseMe', function () {

    /** Override the some grunt functions so we can do some expects */
    beforeEach(function () {
        spyOn(grunt.fail, 'fatal').andCallFake(function (msg) {
            throw new Error(msg);
        });
        spyOn(grunt.util, 'spawn').andCallFake(function (options, callback) {
            callback(null);
        });
        spyOn(grunt.verbose, 'writeln');
        spyOn(grunt.verbose, 'warn');

        release = require('./../tasks/release.js')(grunt)
    });

    afterEach(function () {
        if (grunt.file.exists('.tmp')) {
            grunt.file.delete('.tmp', {force: true});
        }

        if (grunt.file.exists('.release')) {
            grunt.file.delete('.release', {force: true});
        }
    });

    describe('should release', function () {

        function releaseMe(configuration) {
            var hasWd = configuration.wd !== undefined;
            var buildNo = parseInt(configuration.buildNumber);
            var hasBuildNumber = !isNaN(buildNo);
            var hasMainArray = configuration.main instanceof Array;
            var hasDotBower = grunt.file.exists(configuration.cwd, '.bower.json');
            var newVersion = '0.1.1';
            if (hasBuildNumber) {
                newVersion = newVersion + '-build.' + configuration.buildNumber + '+sha.' + (hasDotBower ? '6283298' : 'f75bc5d');
            }

            release.me(configuration, function () {
                if (hasWd) {
                    expect(grunt.verbose.writeln).not.toHaveBeenCalledWith(('No working directory has been defined, using default fallback [.release]').bold);
                } else {
                    expect(grunt.verbose.writeln).toHaveBeenCalledWith(('No working directory has been defined, using default fallback [.release]').bold);
                }
                expect(grunt.verbose.writeln).toHaveBeenCalledWith('Cloning repository [repo.git] to working directory [' + configuration.wd + ']');
                expect(grunt.verbose.writeln).toHaveBeenCalledWith('Copying files to working directory [' + configuration.wd + ']');
                expect(grunt.verbose.writeln).toHaveBeenCalledWith('Updating bower.json with new version [' + newVersion + ']');
                expect(grunt.verbose.writeln).toHaveBeenCalledWith('Adding all files');
                expect(grunt.verbose.writeln).toHaveBeenCalledWith('Committing all added changes');
                expect(grunt.verbose.writeln).toHaveBeenCalledWith('Creating tag [v' + newVersion + ']');
                expect(grunt.verbose.writeln).toHaveBeenCalledWith('Pushing changes to branch [master]');
                expect(grunt.verbose.writeln).toHaveBeenCalledWith('Pushing changes to branch [v' + newVersion + ']');
                if (hasBuildNumber) {
                    if (hasDotBower) {
                        expect(grunt.file.readJSON('./expects/bower.json')).toEqual(grunt.file.readJSON(configuration.wd + '/bower.json'));
                    } else {
                        expect(grunt.file.readJSON('./expects/bower-without-dot-bower.json')).toEqual(grunt.file.readJSON(configuration.wd + '/bower.json'));
                    }
                } else if (hasMainArray) {
                    expect(grunt.file.readJSON('./expects/bower-with-main-array.json')).toEqual(grunt.file.readJSON(configuration.wd + '/bower.json'));
                } else {
                    expect(grunt.file.readJSON('./expects/bower-without-build-and-sha.json')).toEqual(grunt.file.readJSON(configuration.wd + '/bower.json'));
                }

                expect(grunt.file.exists(configuration.wd + '/some_repo_code.js')).toBeTruthy();
                expect(grunt.file.exists(configuration.wd + '/subfolder/some_subfolder_code.js')).toBeTruthy();
            });
        }

        it('when a single file block has been provided in the configuration', function () {
            releaseMe({
                repository: 'repo.git',
                buildNumber: '1',
                main: './some_repo_code.js',
                cwd: './source_repo',
                wd: '.tmp/filesObject',
                files: {
                    cwd: './source_repo/packaged',
                    src: '**/*.js'
                }
            });
        });

        it('when a single file block and no working directory have been provided in the configuration', function () {
            releaseMe({
                repository: 'repo.git',
                buildNumber: '1',
                main: './some_repo_code.js',
                cwd: './source_repo',
                files: {
                    cwd: './source_repo/packaged',
                    src: '**/*.js'
                }
            });
        });

        it('when multiple file blocks have been provided in the configuration', function () {
            releaseMe({
                repository: 'repo.git',
                buildNumber: '1',
                main: './some_repo_code.js',
                cwd: './source_repo',
                wd: '.tmp/filesObjectArray',
                files: [
                    {
                        cwd: './source_repo/packaged',
                        src: '*.js'
                    },
                    {
                        cwd: './source_repo/packaged',
                        src: '**/*.js'
                    }
                ]

            });
        });

        it('when multiple file blocks and no working directory have been provided in the configuration', function () {
            releaseMe({
                repository: 'repo.git',
                buildNumber: '1',
                main: './some_repo_code.js',
                cwd: './source_repo',
                files: [
                    {
                        cwd: './source_repo/packaged',
                        src: '*.js'
                    },
                    {
                        cwd: './source_repo/packaged',
                        src: '**/*.js'
                    }
                ]

            });
        });

        it('when no build number has been provided in the configuration', function () {
            releaseMe({
                repository: 'repo.git',
                main: './some_repo_code.js',
                cwd: './source_repo',
                wd: '.tmp/filesObject',
                files: {
                    cwd: './source_repo/packaged',
                    src: '**/*.js'
                }
            });
        });

        it('when an empty string has been provided as build number in the configuration', function () {
            releaseMe({
                repository: 'repo.git',
                buildNumber: '',
                main: './some_repo_code.js',
                cwd: './source_repo',
                wd: '.tmp/filesObject',
                files: {
                    cwd: './source_repo/packaged',
                    src: '**/*.js'
                }
            });
        });

        it('when an array of main files has been provided in the configuration', function () {
            releaseMe({
                repository: 'repo.git',
                main: ['./some_repo_code.js', './some_repo_code.min.js'],
                cwd: './source_repo',
                wd: '.tmp/mainArray',
                files: {
                    cwd: './source_repo/packaged',
                    src: '**/*.js'
                }
            });
        });

        it('when there is no .bower.json in the cwd', function () {
            releaseMe({
                repository: 'repo.git',
                buildNumber: '1',
                main: './some_repo_code.js',
                cwd: './non_bower_repo',
                wd: '.tmp/dotGitSha',
                files: {
                    cwd: './source_repo/packaged',
                    src: '**/*.js'
                }
            });
        });
    });

    describe('should not release', function () {
        it('when no repository has been provided in the configuration', function () {
            try {
                release.me({
                    main: './some_repo_code.js',
                    cwd: './source_repo'
                }, function () {
                });
            } catch (err) {
                expect(/No repository has been specified/.test(err)).toBeTruthy();
            }
        });

        it('when no current working directory has been provided in the configuration', function () {
            try {
                release.me({
                    repository: 'repo.git',
                    main: './some_repo_code.js'
                }, function () {
                });
            } catch (err) {
                expect(/No current working directory has been specified/.test(err)).toBeTruthy();
            }
        });

        it('when nothing has changed', function () {
            var configuration = {
                repository: 'repo.git',
                buildNumber: '1',
                main: './some_repo_code.js',
                cwd: './non_bower_repo',
                wd: './non_bower_release'
            };

            release.me(configuration, function () {
                expect(grunt.verbose.writeln).toHaveBeenCalledWith('Cloning repository [repo.git] to working directory [' + configuration.wd + ']');
                expect(grunt.verbose.warn).toHaveBeenCalledWith('Nothing to release');
            });
        });
    });
});
