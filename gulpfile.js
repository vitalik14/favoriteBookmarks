//изменить url npm path !!!!!!!!!!!!!!!!
var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    concat = require('gulp-concat'),
    debug = require('gulp-debug'),
    del = require('del'),
    csso = require('gulp-csso');

gulp.task('stylus', ['clean', 'clone'], function() {
   //gulp.src('vendor/panels/popap/css/*.styl')
   //.pipe(stylus({})) // собираем stylus
   //.on('error', console.log) // Если есть ошибки, выводим и продолжаем 
  // .pipe(concat('all.css'))
  // .pipe(gulp.dest('public/css/')) // записываем css
   return gulp.src('public/panels/popap/css/*.styl')
   .pipe(stylus({})) // собираем stylus
   .on('error', console.log) // Если есть ошибки, выводим и продолжаем 
   .pipe(concat('all.css'))
   .pipe(gulp.dest('public/panels/popap/css/')) // записываем css
});
gulp.task('clean', function() {
   return del(['public']);
});
gulp.task('clone', function() {
    return gulp.src('vendor/**/*.*')
    .pipe(gulp.dest('public')) // записываем css
});