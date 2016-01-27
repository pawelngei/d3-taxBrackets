var gulp = require('gulp');
var babel = require('gulp-babel');
var serve = require('gulp-serve');
var plumber = require('gulp-plumber');

var ES6_SOURCE = 'es6/**/*';
var JS_TARGET = 'js';

gulp.task('js', function () {
  return gulp.src(ES6_SOURCE)
        .pipe(plumber())
        .pipe(babel())
        .pipe(gulp.dest(JS_TARGET))
})

gulp.task('watch', function () {
  gulp.watch(ES6_SOURCE, ['js']);
})

gulp.task('serve', serve({
  root: '.',
  port: 8080
}))

gulp.task('default', ['js', 'serve', 'watch'])
