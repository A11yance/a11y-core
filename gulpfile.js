var gulp = require('gulp');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
//var jsdoc = require('gulp-jsdoc');

var paths = {
  scripts: [
    'src/**/*.js'
  ],
  test: [
    'test/**/*.js'
  ]
};

gulp.task('default', function () {
  return gulp
    .src(paths.scripts)
    .pipe(jscs({
      configPath: '.jscsrc',
      esnext: true
    }))
    .pipe(jshint());
});

