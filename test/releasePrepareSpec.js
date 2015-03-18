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
    })

    it('should fail when no repository has been provided in the configuration', function () {
        try {
            release.me({}, function () {
            });
        } catch (err) {
            flag = true;
            expect(/No repository has been specified/.test(err)).toBeTruthy();
        }
    });

    it('should fail when no build number has been provided in the configuration', function () {
        try {
            release.me({
                repository: 'repo.git'
            }, function () {
            });
        } catch (err) {
            flag = true;
            expect(/No buildNumber has been specified/.test(err)).toBeTruthy();
        }
    });

    it('should fail when no current working directory has been provided in the configuration', function () {
        try {
            release.me({
                repository: 'repo.git',
                buildNumber: '1'
            }, function () {
            });
        } catch (err) {
            flag = true;
            expect(/No current working directory has been specified/.test(err)).toBeTruthy();
        }
    });

    it('should release even when the working directory has not been provided in the configuration', function () {
        var buildNumber = '1';
        release.me({
            repository: 'repo.git',
            buildNumber: buildNumber,
            main: './some_repo_code.js',
            cwd: './source_repo'
        }, function () {
            expect(grunt.verbose.writeln).toHaveBeenCalledWith(('No working directory has been defined, using default fallback [.release]').bold);
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Cloning repository [repo.git] to working directory [.release]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Copying files to working directory [.release]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Updating bower.json with new version [0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Adding all files');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Committing all added changes');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Creating tag [v0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Pushing changes to branch [master]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Pushing changes to branch [v0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.file.readJSON('./expects/bower.json')).toEqual(grunt.file.readJSON('.release/bower.json'));
        });
    });

    it('should release even when the working directory has not been provided in the configuration', function () {
        var buildNumber = '1';
        release.me({
            repository: 'repo.git',
            buildNumber: buildNumber,
            main: './some_repo_code.js',
            cwd: './source_repo'
        }, function () {
            expect(grunt.verbose.writeln).toHaveBeenCalledWith(('No working directory has been defined, using default fallback [.release]').bold);
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Cloning repository [repo.git] to working directory [.release]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Copying files to working directory [.release]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Updating bower.json with new version [0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Adding all files');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Committing all added changes');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Creating tag [v0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Pushing changes to branch [master]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Pushing changes to branch [v0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.file.readJSON('./expects/bower.json')).toEqual(grunt.file.readJSON('.release/bower.json'));
        });
    });

    it('should release when the working directory has been provided in the configuration', function () {
        var buildNumber = '1';
        release.me({
            repository: 'repo.git',
            buildNumber: buildNumber,
            main: './some_repo_code.js',
            cwd: './source_repo',
            wd: '.tmp/withWorkingDirWithoutFiles'
        }, function () {
            expect(grunt.verbose.writeln).not.toHaveBeenCalledWith(('No working directory has been defined, using default fallback [.release]').bold);
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Cloning repository [repo.git] to working directory [.tmp/withWorkingDirWithoutFiles]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Copying files to working directory [.tmp/withWorkingDirWithoutFiles]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Updating bower.json with new version [0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Adding all files');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Committing all added changes');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Creating tag [v0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Pushing changes to branch [master]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Pushing changes to branch [v0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.file.readJSON('./expects/bower.json')).toEqual(grunt.file.readJSON('.tmp/withWorkingDirWithoutFiles/bower.json'));
            expect(grunt.file.exists('./.tmp/withWorkingDirWithoutFiles/some_repo_code.js')).toBeFalsy();
            expect(grunt.file.exists('./.tmp/withWorkingDirWithoutFiles/subfolder/some_subfolder_code.js')).toBeFalsy();

        });
    });

    it('should release when the files have been provided in the configuration', function () {
        var buildNumber = '1';
        release.me({
            repository: 'repo.git',
            buildNumber: buildNumber,
            main: './some_repo_code.js',
            cwd: './source_repo',
            wd: '.tmp/withWorkingDirWithFilesSpecifiedAsSingleObject',
            files: {
                cwd: './source_repo/packaged',
                src: '**/*.js'
            }

        }, function () {
            expect(grunt.verbose.writeln).not.toHaveBeenCalledWith(('No working directory has been defined, using default fallback [.release]').bold);
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Cloning repository [repo.git] to working directory [.tmp/withWorkingDirWithFilesSpecifiedAsSingleObject]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Copying files to working directory [.tmp/withWorkingDirWithFilesSpecifiedAsSingleObject]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Updating bower.json with new version [0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Adding all files');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Committing all added changes');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Creating tag [v0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Pushing changes to branch [master]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Pushing changes to branch [v0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.file.readJSON('./expects/bower.json')).toEqual(grunt.file.readJSON('.tmp/withWorkingDirWithFilesSpecifiedAsSingleObject/bower.json'));
            expect(grunt.file.exists('./.tmp/withWorkingDirWithFilesSpecifiedAsSingleObject/some_repo_code.js')).toBeTruthy();
            expect(grunt.file.exists('./.tmp/withWorkingDirWithFilesSpecifiedAsSingleObject/subfolder/some_subfolder_code.js')).toBeTruthy();

        });
    });

    it('should release even when the working directory has not been provided in the configuration', function () {
        var buildNumber = '1';
        release.me({
            repository: 'repo.git',
            buildNumber: buildNumber,
            main: './some_repo_code.js',
            cwd: './source_repo',
            wd: '.tmp/withWorkingDirWithFilesSpecifiedAsObjectArray',
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

        }, function () {
            expect(grunt.verbose.writeln).not.toHaveBeenCalledWith(('No working directory has been defined, using default fallback [.release]').bold);
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Cloning repository [repo.git] to working directory [.tmp/withWorkingDirWithFilesSpecifiedAsObjectArray]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Copying files to working directory [.tmp/withWorkingDirWithFilesSpecifiedAsObjectArray]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Updating bower.json with new version [0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Adding all files');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Committing all added changes');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Creating tag [v0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Pushing changes to branch [master]');
            expect(grunt.verbose.writeln).toHaveBeenCalledWith('Pushing changes to branch [v0.1.1-build.' + buildNumber + '+sha.6283298]');
            expect(grunt.file.readJSON('./expects/bower.json')).toEqual(grunt.file.readJSON('.tmp/withWorkingDirWithFilesSpecifiedAsObjectArray/bower.json'));
            expect(grunt.file.exists('./.tmp/withWorkingDirWithFilesSpecifiedAsObjectArray/some_repo_code.js')).toBeTruthy();
            expect(grunt.file.exists('./.tmp/withWorkingDirWithFilesSpecifiedAsObjectArray/subfolder/some_subfolder_code.js')).toBeTruthy();

        });
    });

});
