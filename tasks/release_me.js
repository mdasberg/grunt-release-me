/*
 * grunt-release-me
 * https://github.com/mdasberg/grunt-release-me
 *
 * Copyright (c) 2015 Mischa Dasberg
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    /**
     * Release me.
     *
     * 1. clone the repository
     * 2. copy the specified files to the release repository
     * 3. update the bower.json file with the correct new version
     * 4. add all changes
     * 5. commit all added changes
     * 6. create tag
     * 7. push to master
     * 8. push tag to remote
     */
    grunt.registerMultiTask('releaseMe', 'Release me', function () {
        require('./release')(grunt).me(this.data, this.async());
    });

};
