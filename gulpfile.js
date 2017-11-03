var gulp = require('gulp')
var uglify = require('gulp-uglify')

gulp.task('default', function() {
    gulp.src('dist/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
})