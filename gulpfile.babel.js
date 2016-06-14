'use strict';

import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

var $ = gulpLoadPlugins();

const DIRS = {
  SRC: 'src',
  DEST: 'build',
  DOCS: 'docs'
};

gulp.task('build', () => {
  return gulp.src([`./${DIRS.SRC}/base/*.js`, `./${DIRS.SRC}/components/**/*.js`])
    .pipe($.concat('channel_base.js'))
    .pipe(gulp.dest(`./${DIRS.DEST}/`))
    .pipe($.rename({suffix: '.min'}))
    .pipe($.uglify())
    .pipe(gulp.dest(`./${DIRS.DEST}/`));
});

gulp.task('doc', (cb) => {
  let config = require('./jsdocConfig.json');
  gulp.src(['README.md', `./${DIRS.SRC}/**/*.js`], {read: false})
    .pipe($.jsdoc3(config, cb));
});

gulp.task('default', ['build', 'doc']);