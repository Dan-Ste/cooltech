'use strict';

  var gulp = require('gulp');
  var plugins = require('gulp-load-plugins')();
  var browserSync = require("browser-sync");
  var fs = require('fs');
  var del = require('del');
  var wiredep = require('wiredep');
  var bowerFiles = require('main-bower-files');
  var browserify = require('browserify');
  var spritesmith = require('gulp.spritesmith');
  var buffer = require('vinyl-buffer');
  var merge = require('merge-stream');
  var source = require('vinyl-source-stream');
  var reload = browserSync.reload;
  var useJade = true; // change to 'true' if using Jade

var path = {
    app: { // Source folder
      html: 'app/html/*.html',
      jade: 'app/jade/_pages/*.jade',
      js: 'app/js/main.js',
      style: 'app/style/main.scss',
      img: ['app/img/**/*.+(png|jpg|jpeg|gif|svg)', '!app/img/icons/**/*.+(png|jpg|jpeg|gif|svg)'],
      fonts: 'app/fonts/**/*.*'
    },
    dist: { // Development folder
      html: 'dist/',
      js: 'dist/js/',
      css: 'dist/css/',
      img: 'dist/img/',
      fonts: 'dist/fonts/'
    },
    prod: { // Production folder
      html: 'prod/',
      js: 'prod/js/',
      css: 'prod/css/',
      img: 'prod/img/',
      fonts: 'prod/fonts/'
    },
    watch: { // Paths for watch
      html: 'app/**/*.html',
      jade: 'app/jade/**/*.jade',
      js: 'app/js/**/*.js',
      style: 'app/style/**/*.scss',
      img: ['app/img/**/*.*', '!app/img/icons/**/*.+(png|jpg|jpeg|gif|svg)'],
      sprite: 'app/img/icons/**/*.+(png|jpg|jpeg|gif|svg)',
      fonts: 'app/fonts/**/*.*'
    },
    clean: { // Paths for clean dist or prod folders
      dist: './dist',
      prod: './prod'
    }
};

/* Common tasks */
gulp.task('lint', function() {
  gulp.src(path.app.js)
      .pipe(reload({stream: true, once: true}))
      .pipe(plugins.eslint())
      .pipe(plugins.eslint.format())
      .pipe(plugins.if(!browserSync.active, plugins.eslint.failAfterError()));
});

gulp.task('favicons', function() {
  return gulp.src('app/favicons/*')
    .pipe(gulp.dest('dist/favicons'))
    .pipe(gulp.dest('prod/favicons'))
});

gulp.task('bowerStyle', function() {
  return gulp.src(bowerFiles())
    .pipe(gulp.dest('dist/bower_components'))
    .pipe(gulp.dest('prod/bower_components'))
});

gulp.task('sprite', function () {
  // Generate our spritesheet
  var spriteData = gulp.src('app/img/icons/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    imgPath: '../img/sprite.png',
    cssName: '_sprite.scss',
    cssVarMap: function (sprite) {
      sprite.name = 'sprite_' + sprite.name;
    }
  }));

  // Pipe image stream through image optimizer and onto disk
  var imgStream = spriteData.img
    // DEV: We must buffer our stream into a Buffer for `imagemin`
    .pipe(buffer())
    .pipe(plugins.imagemin())
    .pipe(gulp.dest(path.dist.img))
    .pipe(gulp.dest(path.prod.img))

  // Pipe CSS stream through CSS optimizer and onto disk
  var cssStream = spriteData.css
    .pipe(gulp.dest('app/style/partials/'));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});

/* DIST */
gulp.task('template:dist', function() {
  if (useJade) {
    gulp.src(path.app.jade)
        .pipe(plugins.plumber())
        .pipe(plugins.jade({
          locals: JSON.parse( fs.readFileSync('phones.js', { encoding: 'utf8' }) )
        }))
        .pipe(plugins.prettify({indent_size: 2}))
        .pipe(gulp.dest(path.dist.html))
        .pipe(reload({stream: true}));
  } else {
    gulp.src(path.app.html)
        .pipe(gulp.dest(path.dist.html))
        .pipe(reload({stream: true}));
  }
});

gulp.task('js:dist', function() {
  return browserify(path.app.js)
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest(path.dist.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:dist', ['sprite'], function () { // Build sprite before other styles
  gulp.src(path.app.style)
      .pipe(plugins.plumber())
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.sass.sync({
        outputStyle: 'expanded',
        precision: 10,
        includePaths: ['.']
      }).on('error', plugins.sass.logError))
      .pipe(plugins.autoprefixer())
      .pipe(plugins.sourcemaps.write())
      .pipe(gulp.dest(path.dist.css))
      .pipe(reload({stream: true}));
});

gulp.task('image:dist', function () {
  gulp.src(path.app.img)
      .pipe(gulp.dest(path.dist.img))
      .pipe(reload({stream: true}));
});

gulp.task('fonts:dist', function () {
  return gulp.src(bowerFiles({
    filter: '**/*.{eot,svg,ttf,woff,woff2}'
  }).concat('app/fonts/**/*'))
    .pipe(gulp.dest('dist/fonts'))
    .pipe(reload({stream: true}));
});

/* PROD */
gulp.task('template:prod', ['template:dist', 'bowerStyle'], function () { // This task required bower_components and *.html in dist folder
  if (useJade) {
    gulp.src('dist/*.html')
      .pipe(plugins.plumber())
      .pipe(plugins.useref())
      .pipe(plugins.if('*.css', plugins.minifyCss()))
      .pipe(plugins.prettify({indent_size: 2}))
      .pipe(plugins.htmlhint({'doctype-first': false}))
      .pipe(plugins.htmlhint.reporter())
      .pipe(plugins.minifyHtml({conditionals: true, loose: true}))
      .pipe(gulp.dest(path.prod.html));
  } else {
    gulp.src('dist/*.html')
      .pipe(plugins.plumber())
      .pipe(plugins.useref())
      .pipe(plugins.if('*.css', plugins.minifyCss()))
      .pipe(plugins.htmlhint({'doctype-first': false}))
      .pipe(plugins.htmlhint.reporter())
      .pipe(plugins.minifyHtml({conditionals: true, loose: true}))
      .pipe(gulp.dest(path.prod.html));
  }
});

gulp.task('js:prod', function () {
  return browserify(path.app.js)
        .bundle()
        .pipe(source('main.js'))
        .pipe(plugins.streamify(plugins.uglify()))
        .pipe(gulp.dest(path.prod.js));
});

gulp.task('style:prod', ['sprite'], function () {
  gulp.src(path.app.style)
      .pipe(plugins.plumber())
      .pipe(plugins.sass.sync({
        outputStyle: 'expanded',
        precision: 10,
        includePaths: ['.']
      }).on('error', plugins.sass.logError))
      .pipe(plugins.autoprefixer())
      .pipe(plugins.csso())
      .pipe(plugins.minifyCss())
      .pipe(gulp.dest(path.prod.css));
});

gulp.task('image:prod', function () {
  gulp.src(path.app.img)
      .pipe(plugins.if(plugins.if.isFile, plugins.cache(plugins.imagemin({
        progressive: true,
        interlaced: true,
        // don't remove IDs from SVGs, they are often used
        // as hooks for embedding and styling
        svgoPlugins: [{cleanupIDs: false}]
      }))
      .on('error', function (err) {
        console.log(err);
        this.end();
      })))
      .pipe(gulp.dest(path.prod.img))
});

gulp.task('fonts:prod', function () {
  return gulp.src(bowerFiles({
    filter: '**/*.{eot,svg,ttf,woff,woff2}'
  }).concat('app/fonts/**/*'))
    .pipe(gulp.dest('prod/fonts'));
});

// Watch for dist

gulp.watch(path.watch.html, ['template:dist']);
gulp.watch(path.watch.jade, ['template:dist']);
gulp.watch(path.watch.style, ['style:dist']);
gulp.watch(path.watch.js, ['lint', 'js:dist']);
gulp.watch(path.watch.img, ['image:dist']);
gulp.watch(path.watch.fonts, ['fonts:dist']);
gulp.watch(path.watch.sprite, ['sprite']);
gulp.watch('bower.json', ['bowerStyle']);

gulp.task('server:dist', function () {
  var config = {
      server: {
        baseDir: "./dist"
      },
      // tunnel: true,
      // host: 'localhost',
      port: 9000
  };
  browserSync(config);
});

// Launch production environment with server
gulp.task('server:prod', ['prod'], function () {
  var config = {
      server: {
        baseDir: "./prod"
      },
      port: 8000
  };
  browserSync(config);
});

// Clean prod or dist directories
gulp.task('clean:prod', del.bind(null, 'prod'));
gulp.task('clean:dist', del.bind(null, 'dist'));

// Build Dist
gulp.task('dist', [
  'template:dist',
  'js:dist',
  'style:dist',
  'bowerStyle',
  'favicons',
  'fonts:dist',
  'image:dist',
  'lint'
]);

// Build Prod
gulp.task('prod', [
  'template:prod',
  'js:prod',
  'style:prod',
  'bowerStyle',
  'favicons',
  'fonts:prod',
  'image:prod',
  'lint'
], function() {
  return gulp.src('prod/**/*').pipe(plugins.size({title: 'build', gzip: true}));
});

gulp.task('default', ['dist', 'server:dist'], function() {
});

