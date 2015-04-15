'use script';

var grunt = require('grunt');

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

        release = require('./../tasks/release.js')(grunt)
    });

    describe('should release', function () {

        function releaseMe(configuration) {
            var hasWd = configuration.wd !== undefined;
            var hasBuildNumber = configuration.buildNumber !== undefined;
            var hasMainArray = configuration.main instanceof Array;
            var newVersion = '0.1.1' + (hasBuildNumber ? '-build.' + configuration.buildNumber + '+sha.6283298' : '');
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
                    expect(grunt.file.readJSON('./expects/bower.json')).toEqual(grunt.file.readJSON(configuration.wd + '/bower.json'));
                } else if(hasMainArray) {
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

        it('when a no build number has been provided in the configuration', function () {
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

        it('when an array of main files has been provided in the configuration', function () {
            releaseMe({
                repository: 'repo.git',
                main: ['./some_repo_code.js','./some_repo_code.min.js'],
                cwd: './source_repo',
                wd: '.tmp/mainArray',
                files: {
                    cwd: './source_repo/packaged',
                    src: '**/*.js'
                }
            });
        });
    });

    describe('should not release', function () {
        function releaseMe(configuration) {
            var hasWd = configuration.wd !== undefined;
            var hasBuildNumber = configuration.buildNumber !== undefined;
            var newVersion = '0.1.1' + (hasBuildNumber ? '-build.' + configuration.buildNumber + '+sha.6283298' : '');
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
                    expect(grunt.file.readJSON('./expects/bower.json')).toEqual(grunt.file.readJSON(configuration.wd + '/bower.json'));
                } else {
                    expect(grunt.file.readJSON('./expects/bower-without-build-and-sha.json')).toEqual(grunt.file.readJSON(configuration.wd + '/bower.json'));
                }

                expect(grunt.file.exists(configuration.wd + '/some_repo_code.js')).toBeFalsy();
                expect(grunt.file.exists(configuration.wd + '/subfolder/some_subfolder_code.js')).toBeFalsy();
            });
        }

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
    });
});
