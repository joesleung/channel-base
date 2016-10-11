'use strict';

import path from 'path';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import Maltose from 'maltose';
import processCMD from './tasks/process_cmd';

var $ = gulpLoadPlugins();
var maltose;

const DIRS = {
  SRC: 'src',
  DEST: 'build',
  DOCS: 'docs',
  DEMO: 'demo'
};

const CDN = {
  static: '//static.360buyimg.com',
  misc: '//misc.360buyimg.com'
};

var argv = require('yargs').argv;
var cdn = argv.cdn ? CDN[argv.cdn] : CDN.STATIC;

gulp.task('build', ['base'], () => {
  return gulp.src([`./${DIRS.SRC}/base/*.js`, `./${DIRS.SRC}/components/**/*.js`])
    .pipe($.concat('channel_base.js'))
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

gulp.task('doc:watch', ['doc'], () => {
  let cur = maltose.getCurrentUrl();
  cur && maltose.reload([cur]);
});

gulp.task('watch', ['doc:serve'], () => {
  gulp.watch([`./${DIRS.SRC}/**/*`,`./${DIRS.DEMO}/**/*`], ['doc:watch']);
});

gulp.task('component', () => {
  return gulp.src([ `./${DIRS.SRC}/components/**/*.js`])
    .pipe(processCMD({
      cdn: cdn,
      prefixDir: path.resolve(`./${DIRS.SRC}/components/`),
      baseDir: '/mtd/pc/components/1.0.0/'
    }))
    .pipe($.uglify().on('error', console.log))
    .pipe(gulp.dest(`./${DIRS.DEST}/components/1.0.0/`));
});

//base & component
gulp.task('base', ['component'],() => {
  const BASE_FILES = [
    `./${DIRS.SRC}/base/class.js`,
    `./${DIRS.SRC}/base/events.js`,
    `./${DIRS.SRC}/base/json2.js`,
    `./${DIRS.SRC}/base/o2console.js`,
    `./${DIRS.SRC}/base/store.js`,
    `./${DIRS.SRC}/base/tmpl.js`,
    `./${DIRS.SRC}/base/ajax_setup.js`,
    `./${DIRS.SRC}/base/load_async.js`
  ];
  const CHANNEL_FILES = [
    `./${DIRS.SRC}/base/widget_lazyload.js`,
    `./${DIRS.SRC}/base/main.js`
  ];
  return gulp.src(BASE_FILES)
    .pipe($.concat('base.js'))
    .pipe($.uglify().on('error', console.log))
    .pipe(gulp.dest(`./${DIRS.DEST}/base/1.0.0/`))
    .on('finish', () => {
      gulp.src(CHANNEL_FILES)
        .pipe($.concat('channel.js'))
        .pipe($.uglify().on('error', console.log))
        .pipe(gulp.dest(`./${DIRS.DEST}/base/1.0.0/`));
    });
});