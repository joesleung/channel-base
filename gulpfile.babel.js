'use strict';

import path from 'path';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import Maltose from 'maltose';

var $ = gulpLoadPlugins();
var maltose;

const DIRS = {
  SRC: 'src',
  DEST: 'build',
  DOCS: 'docs',
  DEMO: 'demo'
};

gulp.task('build', () => {
  return gulp.src([`./${DIRS.SRC}/base/*.js`, `./${DIRS.SRC}/components/**/*.js`])
    .pipe($.concat('channel_base.js'))
    .pipe(gulp.dest(`./${DIRS.DEST}/`))
    .pipe($.rename({suffix: '.min'}))
    .pipe($.uglify().on('error', console.log))
    .pipe(gulp.dest(`./${DIRS.DEST}/`));
});

gulp.task('doc', ['build'], (cb) => {
  let config = require('./jsdocConfig.json');
  gulp.src(['README.md', `./${DIRS.SRC}/**/*.js`], {read: false})
    .pipe($.jsdoc3(config, function () {
      gulp.src([`./${DIRS.DEMO}/**`, `./${DIRS.DEST}/**`], {base: './'})
        .pipe(gulp.dest(`./${DIRS.DOCS}`))
        .on('end', cb);
    }));
});

gulp.task('doc:serve', ['doc'], () => {
  maltose = new Maltose({
    port: 8080,
    server: {
      baseDir: path.resolve(`./${DIRS.DOCS}`),
      index: 'index.html'
    }
  });
  maltose.serve();
});

gulp.task('default', ['doc']);

gulp.task('doc:watch', ['build'], () => {
  console.log('watching..')
  let config = require('./jsdocConfig.json');
  gulp.src(['README.md', `./${DIRS.SRC}/**/*.js`], {read: false})
    .pipe($.jsdoc3(config, function () {
      gulp.src([`./${DIRS.DEMO}/**`, `./${DIRS.DEST}/**`], {base: './'})
      .pipe(gulp.dest(`./${DIRS.DOCS}`))
      .on('end',()=>{
          let cur = maltose.getCurrentUrl();
          cur && maltose.reload([cur]);
      })
    }));
});

gulp.task('watch', ['doc:serve'], () => {
    gulp.watch([`./${DIRS.SRC}/**/*`,`./${DIRS.DEMO}/**/*`],['doc:watch']);
});