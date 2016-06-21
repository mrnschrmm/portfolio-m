'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var useref = require('gulp-useref');
var gulpIf = require('gulp-if');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var browserSync = require('browser-sync').create();
var del = require('del');
var runSequence = require('run-sequence');

//  development process

gulp.task('browserSync', function() {
    browserSync.init({
        server: "./src",
    })
})
gulp.task('sass', function () {
    gulp.src('./src/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cssnano())
    .pipe(sourcemaps.write('./'))

  .pipe(gulp.dest('./src/css/'))
  .pipe(browserSync.reload({
      stream: true
    }))
});
gulp.task('watch', ['browserSync', 'sass'], function () {
  gulp.watch('./src/sass/**/*.scss', ['sass']);
  gulp.watch('./src/*.html', browserSync.reload);
  gulp.watch('./src/pages/*.html', browserSync.reload);
  gulp.watch('./src/js/**/*.js', browserSync.reload);
});

//  production process

gulp.task('useref', function(){
  return gulp.src(['./src/pages/*.html','./src/index.html'])
  .pipe(useref())
  .pipe(gulpIf('*.js', uglify()))
  .pipe(gulpIf('*.css', cssnano()))
  .pipe(gulpIf('!*.html', gulp.dest('./dist')))
  .pipe(gulpIf(['*.html','!index.html'], gulp.dest('./dist/pages')))
  .pipe(gulpIf('index.html', gulp.dest('./dist')))
});
gulp.task('images', function(){
    return gulp.src('./src/assets/images/*.+(png|jpg|gif)')
        .pipe(cache(imagemin({
            interlaced: true
        })))
    .pipe(gulp.dest('dist/assets/images'))
});
gulp.task('icons', function() {
    return gulp.src('./src/assets/icons/*')
    .pipe(gulp.dest('dist/assets/icons'))
})
gulp.task('fonts', function() {
    return gulp.src('./src/assets/fonts/**/*')
    .pipe(gulp.dest('dist/assets/fonts'))
})
gulp.task('clean:dist', function() {
    return del.sync('dist');
})
gulp.task('cache:clear', function (callback) {
    return cache.clearAll(callback)
})

//  task sequences

gulp.task('default', function (callback) {
    runSequence(['sass','browserSync', 'watch'],
    callback
    )
})
gulp.task('build', function (callback) {
    runSequence('clean:dist', ['sass', 'useref', 'images', 'icons', 'fonts'],
    callback
    )
})
