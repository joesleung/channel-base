'use strict';

import path from 'path';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import Maltose from 'maltose';

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

gulp.task('doc:serve', ['doc'], () => {
  var maltose = new Maltose({
    port: 8080,
    server: {
      baseDir: path.resolve(`./${DIRS.DOCS}`),
      index: 'index.html'
    }
  });
  maltose.serve();
});

gulp.task('default', ['build', 'doc']);