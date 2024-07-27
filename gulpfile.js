const { src, dest, series, parallel, watch } = require("gulp");
const babel = require("gulp-babel");
const browserSync = require("browser-sync").create();
const compressHTML = require("gulp-htmlmin");
const compressCSS = require("gulp-clean-css");
const compressJS = require("gulp-uglify");
const del = import("del");
const pug = require("gulp-pug");
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const through2 = require("through2");

const globs = {
  src: {
    dir: "./src",
    get markup() {
      return `${this.dir}/index.pug`;
    },
    get style() {
      return `${this.dir}/style.scss`;
    },
    get script() {
      return `${this.dir}/script.js`;
    },
    get copy() {
      return [`${this.dir}/images/*.*`, `${this.dir}/fonts/*.*`];
    },
  },
  output: {
    dir: "./dist",
    get children() {
      return [`${this.dir}/**`, `!${this.dir}`];
    },
    basenames: {
      markup: "index.html",
      style: "style.css",
      script: "script.js",
    },
  },
};

async function deleteDistFolder() {
  const { deleteAsync } = await del;
  deleteAsync(globs.output.children);
}

function processMarkupDev() {
  return src(globs.src.markup)
    .pipe(sourcemaps.init())
    .pipe(pug())
    .pipe(
      through2.obj(function (file, _, done) {
        file.basename = globs.output.basenames.markup;
        done(null, file);
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest(globs.output.dir));
}

function processMarkupProd() {
  return src(globs.src.markup)
    .pipe(pug())
    .pipe(compressHTML({ collapseWhitespace: true, removeComments: true }))
    .pipe(
      through2.obj(function (file, _, done) {
        file.basename = globs.output.basenames.markup;
        done(null, file);
      })
    )
    .pipe(dest(globs.output.dir));
}

function processStyleDev() {
  return src(globs.src.style)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(
      through2.obj(function (file, _, done) {
        file.basename = globs.output.basenames.style;
        done(null, file);
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest(globs.output.dir));
}

function processStylesProd() {
  return src(globs.src.style)
    .pipe(sass())
    .pipe(compressCSS())
    .pipe(
      through2.obj(function (file, _, done) {
        file.basename = globs.output.basenames.style;
        done(null, file);
      })
    )
    .pipe(dest(globs.output.dir));
}

function processScriptDev() {
  return src(globs.src.script)
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(
      through2.obj(function (file, _, done) {
        file.basename = globs.output.basenames.script;
        done(null, file);
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest(globs.output.dir));
}

function processScriptProd() {
  return src(globs.src.script)
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(compressJS())
    .pipe(
      through2.obj(function (file, _, done) {
        file.basename = globs.output.basenames.script;
        done(null, file);
      })
    )
    .pipe(dest(globs.output.dir));
}

function copy() {
  return src(globs.src.copy, { encoding: false, base: globs.src.dir }).pipe(
    dest(globs.output.dir)
  );
}

const buildDev = parallel(
  processMarkupDev,
  processStyleDev,
  processScriptDev,
  copy
);
const buildProd = parallel(
  processMarkupProd,
  processStylesProd,
  processScriptProd,
  copy
);

async function startServer() {
  browserSync.init({
    server: globs.output.dir,
  });
}

async function watchFiles() {
  watch(globs.src.dir).on("change", series(buildDev, browserSync.reload));
}

exports.default = series(deleteDistFolder, buildDev, watchFiles, startServer);

exports.build = series(deleteDistFolder, buildProd);
