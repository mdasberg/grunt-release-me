/*
 * grunt-release-me
 * https://github.com/mdasberg/grunt-release-me
 *
 * Copyright (c) 2015 Mischa Dasberg and contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    /**
     * Release me.
     *
     * 1. clone the repository
     * 2. detect changes
     * 3. copy the specified files to the release repository
     * 4. update the bower.json file with the correct new version
     * 5. add all changes
     * 6. commit all added changes
     * 7. create tag
     * 8. push to master
     * 9. push tag to remote
     */
    grunt.registerMultiTask('releaseMe', 'Release me', function () {
        require('./release')(grunt).me(this.data, this.async());
    });

};
