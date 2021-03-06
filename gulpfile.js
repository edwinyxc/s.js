var gulp = require('gulp'),
    jshint = require('gulp-jshint')
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    shell  = require('gulp-shell');


gulp.task('doc', shell.task([
    'mocha -R doc > doc.html'
]));

gulp.task('md', shell.task([
    'mocha -R markdown test/doc.js > README.MD'
]));

gulp.task('test', shell.task([
    'mocha'
]));

gulp.task('jshint', function(){
    gulp.src('src/s.js').pipe(jshint());
});

gulp.task('uglify', function() {
    gulp.src('src/s.js')
    .pipe(uglify())
    .pipe(rename('index.js'))
    .pipe((gulp.dest('./')));
});

gulp.task('default', function() {
    gulp.watch('./src/s.js', function(evt) {
        gulp.run('uglify')
    })
})
