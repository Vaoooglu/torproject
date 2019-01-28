var
  gulp = require('gulp'),
  concat = require('gulp-concat'), // Склейка файлов
  browserSync = require('browser-sync'), // BrowserSync
  //pug = require('gulp-pug'), // Pug обработчик html
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  cssnano = require('gulp-cssnano'), //Минификация CSS
  autoprefixer = require('gulp-autoprefixer'), // Автопрефиксы CSS
  imagemin = require('gulp-imagemin'), // Сжатие JPG, PNG, SVG, GIF
  uglify = require('gulp-uglify'), // Минификация JS
  plumber = require('gulp-plumber'),
  shorthand = require('gulp-shorthand'), // шорт код
  rename = require('gulp-rename'),
  watch = require('gulp-watch'),
  rigger = require('gulp-rigger'), // іморт файлів в файл like //="../../../bower_components/...
  gcmq = require('gulp-group-css-media-queries'), // обєднує media з однаковими breakpoint
  criticalCss = require('gulp-penthouse'),
  print = require('gulp-print').default,
  clean = require('gulp-clean'),
  path = require('path'),
  cache = require('gulp-cached'),
  remember = require('gulp-remember'),
  dependents = require('gulp-dependents'),
  rtlcss = require('gulp-rtlcss'),
  cond = require('gulp-cond');

var paths = {
  name: "boiler",
  build: { //Куда складывать готовые файлы
    server: 'build/',
    html: 'build/',
    js: 'build/js/',
   // jsVendor: 'build/js/vendor/',
    css: 'build/css/',
    img: 'build/img/',
    fonts: 'build/css/fonts/',
    favicon: 'build/favicon/'
  },
  src: { //Пути откуда брать исходники
   // pug: ['src/pug/*.pug', '!src/pug/_*.pug'],
    html:'src/*',
    js: 'src/js/script.js',
    //jsVendor: 'src/js/vendor.js',
    scss: ['src/css/sass/**/*.scss', 'src/sass/_*.scss'],
    img: 'src/img/**/*.*',
    fonts: 'src/fonts/*',
    favicon: 'src/favicon/*'
  },
  watch: { //Пути файлов, за которыми хотим наблюдать
  //  pug: './src/pug/**/*.pug',
    html: './src/*.html',
    js: './src/js/script.js',
    //jsVendor: './src/js/vendor.js',
    scss: ['src/css/**/*.scss', 'src/css/sass/_*.scss'],
    img: './src/img/**/*',
    favicon: './src/favicon/*',
    fonts: './src/fonts/*'
  }
};


function favicon_fn() {
  return gulp.src(paths.src.favicon)
    .pipe(plumber())
    .pipe(gulp.dest(paths.build.favicon))
    .pipe(browserSync.stream());
}

function fonts_fn() {
  return gulp.src(paths.src.fonts)
    .pipe(plumber())
    .pipe(gulp.dest(paths.build.fonts))
    .pipe(browserSync.stream());
}

function imgmin_fn() {
  return gulp.src(paths.src.img)
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 3, progressive: true }))
    .pipe(gulp.dest(paths.build.img))
    .pipe(browserSync.stream());
}

function js_fn() {
  return gulp.src(paths.src.js)
    .pipe(plumber())
    .pipe(rigger())
    .pipe(concat('script.js'))
    .pipe(gulp.dest(paths.build.js))
    .pipe(browserSync.stream());
}

// function jsV_fn() {
//   return gulp.src(paths.src.jsVendor)
//     .pipe(plumber())
//     .pipe(rigger())
//     .pipe(concat('vendor.js'))
//     .pipe(gulp.dest(paths.build.js))
//     .pipe(browserSync.stream());
// }

// function pug_fn() {
//   return gulp.src(paths.src.pug)
//     .pipe(print(filepath => "src " + filepath))
//     .pipe(plumber())
//     .pipe(print(filepath => "saved " + filepath))
//     .pipe(pug({ pretty: true }))
//     .on('error', console.log)
//     .pipe(gulp.dest(paths.build.html))
//     .pipe(browserSync.stream());
// }

function html_fn() {
    return gulp.src(paths.src.html)
      // .pipe(print(filepath => "src " + filepath))
      // .pipe(plumber())
      // .pipe(rigger())
      .pipe(gulp.dest(paths.build.html))
      .pipe(browserSync.stream());
  }



// gulp.task('html:build',function () {
//     gulp.src(path.src.html)
//         .pipe(rigger())
//         .pipe(gulp.dest(path.build.html))
//         .pipe(reload({stream: true}));
// });




function sass_fn() {
  return gulp.src(paths.src.scss)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(rigger())
    .pipe(cache('sass'))
    .pipe(print(filepath => "file saved " + filepath))
    .pipe(dependents())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 15 versions'] }))
    // .pipe(shorthand())
    // .pipe(cssnano({discardComments: {removeAll: true}}))
    .pipe(remember('sass'))
    .pipe(concat('main.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.build.css))
    .pipe(browserSync.stream());
}

// clean
function clean_fn() {
  return gulp.src(paths.build.html)
      .pipe(clean());
}
gulp.task('clr', gulp.series(clean_fn));

// rtl
function rtl_fn() {
  return gulp.src('build/css/main.css')
    .pipe(rtlcss())
    .pipe(rename({ suffix: '-rtl' }))
    .pipe(gulp.dest(paths.build.css))
}
gulp.task('rtl', gulp.series(rtl_fn));

function watch_fn() {
  browserSync({
    server: {
      baseDir: paths.build.server
    },
    port: 8080,
    open: true,
  });
  gulp.watch(paths.watch.favicon, gulp.series(favicon_fn));
  gulp.watch(paths.watch.fonts, gulp.series(fonts_fn));
  gulp.watch(paths.watch.img, gulp.series(imgmin_fn));
  gulp.watch(paths.watch.js, gulp.series(js_fn));
  //gulp.watch(paths.watch.jsVendor, gulp.series(jsV_fn));
  gulp.watch(paths.watch.html, gulp.series(html_fn));
  gulp.watch(paths.watch.scss, gulp.series(sass_fn));
};

var build = gulp.series(
  // clean_fn,
  gulp.parallel(
    favicon_fn,
    fonts_fn,
    imgmin_fn,
    js_fn,
    //jsV_fn,
    html_fn,
    sass_fn,
  )
);

gulp.task('build', build);

gulp.task('default', gulp.series(build, watch_fn));