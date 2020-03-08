'use strict';

/* пути к исходным файлам (src), к готовым файлам (build), 
а также к тем, за изменениями которых нужно наблюдать (watch) */

let dist = 'terifash/build'
let path = {
  build: {
    // html: `${dist}/**/*.html`,
    js: `${dist}/js/`,
    css: `${dist}/css/`,
    img: `${dist}/image/`,
    fonts: `${dist}/fonts/`
  },
  src: {
    // html: 'src/*.html',
    js: 'src/js/resources.js',
    style: 'src/scss/main.scss',
    img: 'src/image/**/*.*',
    fonts: 'src/fonts/**/*.*'
  },
  watch: {
    // html: 'src/**/*.html',
    js: 'src/js/**/*.js',
    css: 'src/scss/**/*.scss',
    img: 'src/image/**/*.*',
    fonts: 'srs/fonts/**/*.*'
  }
};

/* подключаемые плагины */
let gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  rigger = require('gulp-rigger'),
  sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCSS = require('gulp-clean-css'),
  uglify = require('gulp-uglify'),
  cache = require('gulp-cache'),
  imagemin = require('gulp-imagemin'),
  jpegrecompress = require('imagemin-jpeg-recompress'),	
  pngquant = require('imagemin-pngquant'),
  rimraf = require('gulp-rimraf'),
  rename = require('gulp-rename');

/* задачи */

// сбор html
// gulp.task('html:build', function() {
//   return gulp.src(path.src.html) // выбор всех html файлов по указанному пути
//     .pipe(plumber()) // отслеживание ошибок
//     .pipe(rigger()) // импорт вложений
//     .pipe(gulp.dest(path.build.html)) // выкладывание готовых файлов
//     .pipe(webserver.reload({ stream: true })); // перезагрузка сервера
// });

// сбор стилей
gulp.task('css:build', function() {
  return gulp.src(path.src.style) // получим main.scss
    .pipe(plumber()) // для отслеживания ошибок
    .pipe(sourcemaps.init()) // инициализируем sourcemap
    .pipe(sass()) // scss -> css
    .pipe(autoprefixer()) // добавим префиксы
    .pipe(gulp.dest(path.build.css))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cleanCSS()) // минимизируем CSS
    .pipe(sourcemaps.write('./')) // записываем sourcemap
    .pipe(gulp.dest(path.build.css)) // выгружаем в build
});

// сбор js
gulp.task('js:build', function() {
  return gulp.src(path.src.js) // получим файл resources.js
    .pipe(plumber()) // для отслеживания ошибок
    .pipe(rigger()) // импортируем все указанные файлы в resources.js
    .pipe(gulp.dest(path.build.js))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.init()) //инициализируем sourcemap
    .pipe(uglify()) // минимизируем js
    .pipe(sourcemaps.write('./')) //  записываем sourcemap
    .pipe(gulp.dest(path.build.js)) // положим готовый файл
});

// перенос шрифтов
gulp.task('fonts:build', function() {
  return gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts));
});

// обработка картинок
gulp.task('image:build', function() {
  return gulp.src(path.src.img) // путь с исходниками картинок
    .pipe(cache(imagemin([ // сжатие изображений
            imagemin.gifsicle({ interlaced: true }),
            jpegrecompress({
        progressive: true,
        max: 90,
        min: 80
      }),
            pngquant(),
            imagemin.svgo({ plugins: [{ removeViewBox: false }] })
        ])))
    .pipe(gulp.dest(path.build.img)); // выгрузка готовых файлов
});

// очистка кэша
// gulp.task('cache:clear', function() {
//   cache.clearAll();
// });

// сборка
gulp.task('build',
  gulp.parallel(
    'css:build',
    'js:build',
    'fonts:build',
    'image:build'
  )
);

// запуск задач при изменении файлов
gulp.task('watch', function() {
  gulp.watch(path.watch.css, gulp.series('css:build'));
  gulp.watch(path.watch.js, gulp.series('js:build'));
  gulp.watch(path.watch.img, gulp.series('image:build'));
  gulp.watch(path.watch.fonts, gulp.series('fonts:build'));
});

// задача по умолчанию
gulp.task('default', gulp.series(
  'build',
  gulp.parallel('watch')
));