var gulp = require('gulp');
var del = require('del');
let babel = require('gulp-babel');
// var minify = require('gulp-minify');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var pump = require('pump');
const minify = require("gulp-babel-minify");

// gulp.task('default', function () {
//     del(['dist/*.js.map']);
//     gulp.src('dist/*.js')
//         .pipe(uglify())
//         .pipe(gulp.dest('dist'));
// })

gulp.task('default', function () {
    gulp.src('dist/*.js')
        .pipe(minify({
            mangle: {
                keepClassName: true
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