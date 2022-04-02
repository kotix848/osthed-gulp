const {src, dest, watch, series, parallel} = require('gulp');
const sync = require("browser-sync").create();
const del = require("del");

// плагины
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const less = require('gulp-less');
const csso = require('gulp-csso');
const concat = require("gulp-concat");
const notify = require("gulp-notify");
const fileInclude = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const size = require("gulp-size");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");

const html = () => {
    return src("./src/*.html")
        .pipe(plumber({
            errorHandler: notify.onError()
        }))
        .pipe(fileInclude())
        .pipe(size({title: 'До сжатия'}))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(size({title: 'После сжатия'}))
        .pipe(dest("./dist"))
        .pipe(sync.stream())
}

const style = () => {
    return src("./src/css/*.less", {sourcemaps: true})
        .pipe(plumber({
            errorHandler: notify.onError()
        }))
        .pipe(less({}))
        .pipe(concat("style.css"))
        .pipe(dest("./dist/css", {sourcemaps: true}))
        .pipe(rename({suffix: ".min"}))
        .pipe(csso())
        .pipe(dest("./dist/css", {sourcemaps: true}))
        .pipe(sync.stream())
}

// js
const js = () => {
    return src("./src/js/*", {sourcemaps: true})
        .pipe(plumber({
            errorHandler: notify.onError()
        }))
        .pipe(babel())
        .pipe(uglify())
        .pipe(dest("./dist/js", {sourcemaps: true}))
        .pipe(sync.stream())
}

const img = () => {
    return src("./src/img/*")
        .pipe(plumber({
            errorHandler: notify.onError()
        }))
        .pipe(dest("./dist/img"))
        .pipe(imagemin({
            verbose: true
        }))
        .pipe(sync.stream())
}

// delete
const clear = () => {
    return del('./dist');
}


// Server
const server = () => {
    sync.init({
        server: {
            baseDir: "./dist"
        },

        notify: false
    });
}

// Watch
const watcher = () => {
    watch("./src/**/*.html", html);
    watch("./src/css/*.less", style);
    watch("./src/js/*.js", js);
    watch("./src/img/*", img);
}

module.exports.js = js;
module.exports.html = html;
module.exports.watch = watcher;
module.exports.clear = clear;
module.exports.style = style;
module.exports.img = img;

// Сборка
exports.default = series(
    clear,
    parallel(html, style, js, img),
    parallel(watcher, server)
);