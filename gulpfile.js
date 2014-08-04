'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    minifyCSS = require('gulp-minify-css'),
    rimraf = require('rimraf'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    pagespeed = require('psi');

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
        .pipe($.concat('main.min.js'))
        .pipe($.uglify())
        .pipe(gulp.dest('dist/scripts'));
})
//Copy vendors
gulp.task('js:vendor', function () {
    return gulp.src('assets/scripts/vendor/*')
        .pipe(gulp.dest('dist/scripts/vendor'));
})

gulp.task('js', ['js:lint', 'js:minify', 'js:vendor']);

// Optimize Images
gulp.task('images', function () {
    return gulp.src('assets/images/**/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe(reload({stream: true, once: true}))
        .pipe($.size({title: 'images'}));
});

// Compass
gulp.task('compass', function(){
    return gulp.src('assets/styles/**/*.scss')
        .pipe($.compass({
            css: 'dist/css',
            sass: 'assets/styles',
            image: 'assets/images'
      	}))
      	.pipe($.autoprefixer('last 2 versions', 'ie 8'))
        .pipe(minifyCSS())
      	.pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({stream:true}))
  	 	.pipe($.size({title: 'compass'}));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
    return gulp.src('assets/html/**/*.html')
        // Minify Any HTML
        .pipe($.minifyHtml())
        // Output Files
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({stream:true}))
        .pipe($.size({title: 'html'}));
});

// Clean Output Directory
gulp.task('clean', function (cb) {
    rimraf('dist', cb);
});

// Watch Files For Changes & Reload
gulp.task('serve', function () {
    browserSync.init(null, {
        server: {
            baseDir: 'dist'
        },
        notify: false
    });

    gulp.watch(['assets/html/**/*.html'], ['html']);
    gulp.watch(['assets/styles/**/*.scss'], ['compass']);
    gulp.watch(['assets/scripts/*.js'], ['js']);
    gulp.watch(['assets/images/**/*'], ['images']);
});

// Build Production Files
gulp.task('build', function (cb) {
    runSequence('compass', 'js', 'images', 'html', cb);
});

// Default Task
gulp.task('default', ['clean'], function (cb) {
    gulp.start('build', cb);
    gulp.watch(['assets/html/**/*.html'], ['html']);
    gulp.watch(['assets/styles/**/*.scss'], ['compass']);
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
