var gulp = require('gulp');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var jsdoc = require('gulp-jsdoc');

var paths = {
  src: [
    'src/**/*.js'
  ],
  lib: [
    'lib/**/*.js'
  ],
  test: [
    'test/**/*.js'
  ]
};

gulp.task('docs', function () {
  return gulp
    .src(paths.lib.concat(
      ["README.md"]
    ))
    .pipe(jsdoc('./docs'));
});

gulp.task('jscs', function () {
  return gulp
    .src(paths.src)
    .pipe(jscs({
      configPath: '.jscsrc',
      esnext: true,
      fix: true
    }))
    .pipe(gulp.dest('src'));
});

gulp.task('jshint', function () {
  return gulp
    .src(paths.src)
    .pipe(jshint());
});

gulp.task('default', ['jshint', 'jscs']);
gulp.task('compile', ['jshint', 'jscs', 'docs']);

