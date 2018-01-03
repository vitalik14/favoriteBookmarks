//изменить url npm path !!!!!!!!!!!!!!!!
var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    concat = require('gulp-concat'),
    debug = require('gulp-debug'),
    del = require('del'),
    clean = require('gulp-clean'),
    imagemin = require('gulp-imagemin'),
    csso = require('gulp-csso');

gulp.task('clean', function() {
   return del(['public/*']);
});

gulp.task('clone', ['clean'], function() {
    return gulp.src('vendor/**/*.*')
    .pipe(imagemin())
    .pipe(gulp.dest('public')) // записываем css
});

gulp.task('stylus', ['clone'], function() {
   return gulp.src('public/panels/popap/css/*.styl')
   .on('data', function(file) {// console.log(file.base);
   })
   .pipe(stylus({compress: true})) // собираем stylus
   .on('error', console.log) // Если есть ошибки, выводим и продолжаем 
   .pipe(concat('all.css'))
   .pipe(gulp.dest('public/panels/popap/css/')) // записываем css
});

gulp.task('cleanstylus', ['stylus'], function() {
    return gulp.src('public/panels/popap/css/*.styl', {read: false})
    .pipe(clean());
 });


gulp.task('build', ['cleanstylus']);