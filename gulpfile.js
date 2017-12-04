var gulp = require('gulp');
var del = require('del');
let babel = require('gulp-babel');
var minify = require('gulp-minify');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var pump = require('pump');

// gulp.task('default', function () {
//     del(['dist/*.js.map']);
//     gulp.src('dist/*.js')
//         .pipe(uglify())
//         .pipe(gulp.dest('dist'));
// })

gulp.task('default', function () {
    gulp.src('dist/*.js')
        .pipe(minify({
            ext: {
                min: '.js'
            }
        }))
        .on('error', function (err) {
            gutil.log(
                gutil.colors.red('[Error]'), err.toString()
            );
        })
        .pipe(gulp.dest('./dist/'))
    del(['dist/*.js.map']);
});



gulp.task('debug', function (cb) {
    pump([
        gulp.src('dist/*.js'),
        minify({
            ext: {
                min: '.js'
            }
        }),
        gulp.dest('./dist/')
    ], cb);
    del(['dist/*.js.map']);
});