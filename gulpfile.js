'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rimraf = require('rimraf'),
    compass = require('gulp-compass'),
    sass = require('gulp-ruby-sass'),
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
        .pipe(gulp.dest('dest/scripts'));
})
//Copy vendors
gulp.task('js:vendor', function () {
    return gulp.src('assets/scripts/vendor/*')
        .pipe(gulp.dest('dest/scripts/vendor'));
})

gulp.task('js', ['js:lint', 'js:minify', 'js:minify', 'js:vendor']);

// Optimize Images
gulp.task('images', function () {
    return gulp.src('assets/images/**/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dest/images'))
        .pipe(reload({stream: true, once: true}))
        .pipe($.size({title: 'images'}));
});

// Compass
gulp.task('compass', function(){
    return gulp.src('./assets/scss/*.scss')
        .pipe(compass({
            sass: 'assets/scss',
            image: 'assets/images'
      	}))
      	.pipe($.autoprefixer('last 2 versions', 'ie 8'))
      	.pipe(gulp.dest('dest/css'))
  	 	.pipe($.size({title: 'compass'}));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
    return gulp.src('assets/html/**/*.html')
        .pipe($.useref.assets({searchPath: 'assets'}))
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
        .pipe(gulp.dest('./'))
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
            baseDir: './'
        },
        notify: false
    });

    gulp.watch(['assets/html/**/*.html'], reload);
    gulp.watch(['assets/styles/**/*.scss'], ['compass']);
    gulp.watch(['assets/scripts/*.js'], ['js']);
    gulp.watch(['assets/images/**/*'], ['images']);
});

// Build Production Files
gulp.task('build', function (cb) {
    runSequence('compass', ['js', 'html', 'images'], cb);
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
