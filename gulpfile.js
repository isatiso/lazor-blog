var gulp = require('gulp')
var del = require('del')
var uglify = require('gulp-uglify')

gulp.task('default', function() {
    del(['dist/*.js.map']);
    gulp.src('dist/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
})