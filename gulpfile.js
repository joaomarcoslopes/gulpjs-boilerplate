/**
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rimraf = require('rimraf'),
    compass = require('gulp-compass'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    pagespeed = require('psi'),
    reload = browserSync.reload;

// Lint JavaScript
gulp.task('js:lint', function () {
    return gulp.src(['assets/scripts/**/*.js', '!assets/scripts/vendor/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'))
        .pipe(reload({stream: true, once: true}));
});
// Concat and Minify JavaScript
gulp.task('js:minify', function () {
    return gulp.src('assets/scripts/*.js')
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('scripts'));
})
//Copy vendors
gulp.task('js:vendor', function () {
    return gulp.src('assets/scripts/vendor/*')
        .pipe(gulp.dest('scripts/vendor'));
})

gulp.task('js', ['js:lint', 'js:minify', 'js:minify', 'js:vendor']);

// Optimize Images
gulp.task('images', function () {
    return gulp.src('assets/images/**/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('images'))
        .pipe(reload({stream: true, once: true}))
        .pipe($.size({title: 'images'}));
});

// Compass
gulp.task('compass', function(){
    return gulp.src('assets/styles/*.scss')
        .pipe(compass({
            css: 'css',
            sass: 'assets/scss',
            image: 'assets/images'
      	}))
      	.pipe(concat('main.scss'))
      	.pipe(sass({unixNewlines: true, style: 'compressed'}))
      	.pipe(gulp.dest('css'))
  	 	.pipe($.size({title: 'compass'}));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
    return gulp.src('assets/html/**/*.html')
        .pipe($.useref.assets({searchPath: '{.tmp,assets}'}))
        // Concatenate And Minify JavaScript
        .pipe($.if('*.js', $.uglify()))
        // Concatenate And Minify Styles
        .pipe($.if('*.css', $.csso()))
        // Remove Any Unused CSS
        .pipe($.useref.restore())
        .pipe($.useref())
        // Update Production Style Guide Paths
        .pipe($.replace('css/main.css'))
        // Minify Any HTML
        .pipe($.minifyHtml())
        // Output Files
        .pipe(gulp.dest('dist'))
        .pipe($.size({title: 'html'}));
});

// Clean Output Directory
gulp.task('clean', function (cb) {
    rimraf('dist', rimraf.bind({}, '.tmp', cb));
});

// Watch Files For Changes & Reload
gulp.task('serve', function () {
    browserSync.init(null, {
        server: {
            baseDir: ['assets', '.tmp']
        },
        notify: false
    });

    gulp.watch(['assets/**/*.html'], reload);
    gulp.watch(['assets/styles/**/*.{css,scss}'], ['compass']);
    gulp.watch(['.tmp/styles/**/*.css'], reload);
    gulp.watch(['assets/scripts/**/*.js'], ['jshint']);
    gulp.watch(['assets/images/**/*'], ['images']);
});

// Build Production Files
gulp.task('build', function (cb) {
    runSequence('styles', ['js', 'html', 'images'], cb);
    // runSequence('compass', ['js', 'images'], cb);
});

// Default Task
gulp.task('default', ['clean'], function (cb) {
    gulp.start('build', cb);
    gulp.watch(['.tmp/styles/**/*.css'], reload);
    gulp.watch(['assets/scripts/*.js'], ['js']);
    gulp.watch(['assets/images/**/*'], ['images']);
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
gulp.task('pagespeed', pagespeed.bind(null, {
    // By default, we use the PageSpeed Insights
    // free (no API key) tier. You can use a Google
    // Developer API key if you have one. See
    // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
    url: 'https://example.com',
    strategy: 'mobile'
}));
