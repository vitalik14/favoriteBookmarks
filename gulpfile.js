//изменить url npm path !!!!!!!!!!!!!!!!
var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    concat = require('gulp-concat'),
    debug = require('gulp-debug'),
    del = require('del'),
    clean = require('gulp-clean'),
    imagemin = require('gulp-imagemin'),
    csso = require('gulp-csso'),
    htmlmin = require('gulp-htmlmin'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

    // uglify = require('gulp-uglify');
    // gutil = require('gulp-util');
    // uglify = require('gulp-uglify'),
    // pump = require('pump');
    // complexity = require('gulp-complexity');

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

gulp.task('minify', ['stylus'], function(file) {
  
  return gulp.src('public/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('public'));
});
// gulp.task('compress',['minify'], function(){
// 	return gulp.src('vendor/**/*.js')
// 		.pipe(complexity());
// });
// gulp.task('compress',['minify'], function (cb) q{
//     pump([
//           gulp.src('vendor/**/*.js'),
//           uglify(),
//           gulp.dest('public')
//       ],
//       cb
//     );
//   });
gulp.task('scripts', ['minify'], function() {
    return gulp.src(
        [
            'public/panels/popap/src/classes/Core.js',
            'public/panels/popap/src/classes/DragDrop.js',
            'public/panels/popap/src/classes/Tags.js',
            'public/panels/popap/src/translate.js',
            'public/panels/popap/src/popup.js',
            'public/panels/popap/src/tops.js',
            'public/panels/popap/src/tabs.js',
            'public/panels/popap/src/bookmarks.js',
            'public/panels/popap/src/history.js',
            'public/panels/popap/src/main.js'
        ])
      .pipe(concat('all.js'))
      .pipe(gulp.dest('public/panels/popap/js'))
});

gulp.task('deljs', ['scripts'], function() {
    return gulp.src('public/panels/popap/css/*.styl', {read: false})
    .pipe(clean());
});

gulp.task('cleanstylus', ['deljs'], function() {
    return gulp.src('public/panels/popap/src', {read: false})
    .pipe(clean());
});

gulp.task('default', ['cleanstylus']);
gulp.watch('vendor/**/*.*', ['cleanstylus']);