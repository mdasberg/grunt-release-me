# grunt-release-me

> Grunt plugin for releasing a project to a seperate git repository which can be registered with bower.io.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-release-me --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-release-me');
```

## The "release_me" task

### Overview
In your project's Gruntfile, add a section named `release_me` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  releaseMe: {
    your_target: {
      // Target-specific file lists and/or options go here.
    }
  }
});
```
### Options

#### repository
Type: `String`
Mandatory: true

Should be the url to the git repository which has been registered with bower.io.

#### buildNumber
Type: `String`

Should be build number. This number will be used in the new version for identification purposes.

#### main
Type: `String` or `Array` of String

Should be the main js file(s).

#### cwd
Type: `String`
Mandatory: true

Should be the directory of the source repository in which the bower.json file is located.

#### wd
Type: `String`
Mandatory: true

Should be the directory to which the bower repository will be cloned to.

#### files
Type: `Object` or `Array`

Should be the files that need to be pushed to the bower repository.

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  releaseMe: {
     your_target: {
        repository: 'repo.git',
        buildNumber: '1',
        main: './some_repo_code.js',
        cwd: './source_repo',
        wd: '.tmp/some_repo',
        files: [{
           cwd: './source_repo/packaged',
           src: '*.js'
        }]
     }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
