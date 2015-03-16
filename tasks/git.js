function Git(grunt) {

    return {
        /* Clone the repository into the specified directory */
        clone: function(repository, workingDirectory, done) {
            var options = {
                cmd: 'git',
                args: ['clone', repository, workingDirectory],
                opts: {
                    stdio: 'inherit'
                }
            };
            grunt.util.spawn(options, function(error, result, code) {
                grunt.verbose.writeln(result);
                if (error !== null) {
                    grunt.fail.fatal('Could not clone repository');
                }
                done();
            })
        }
    };
}

module.exports = Git;