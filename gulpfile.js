const {src, dest, parallel, series, watch} = require('gulp');

// folders
const project_folder = "dist/";
const source_folder = "@source/";

// paths
const path = {
    build : {
        html : project_folder,
        css : project_folder + 'css/',
        js : project_folder + 'js/',
        img : project_folder + 'img/'
    },
    src : {
        html : source_folder + '*.html',
        css : [source_folder + 'scss/*.scss', source_folder + 'scss/inline.scss'],
        js : source_folder + 'js/main.js',
        img : source_folder + 'images/**/*.{jpg,png,svg,gif,ico,webp}'
    },
    watch : {
        html : source_folder + '**/*.html',
        css : source_folder + 'scss/**/*.scss',
        js : source_folder + 'js/*.js',
        img : source_folder + 'images/**/*.{jpg,png,svg,gif,ico,webp}'
    },
    del : project_folder + '**/*'
};

const jsSourceFiles = [
    'node_modules/jquery/dist/jquery.slim.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.js',
    'node_modules/bootstrap/dist/js/bootstrap.js',
    path.src.js
    ];

// general purpose
const browserSync = require('browser-sync').create();
const del = require('del');

// html
const fileinclude = require('gulp-file-include');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const inlinesource = require('gulp-inline-source');

 

// js
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const strip = require('gulp-strip-comments');

// css
const sass = require('gulp-sass');
const groupCssMediaQueries = require('gulp-group-css-media-queries');
const cleanCss = require('gulp-clean-css');
const uncss = require('gulp-uncss');

// images
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const webpHtml = require('gulp-webp-html');
const webpCss = require('gulp-webp-css');


function browser_sync() {
    browserSync.init( {
        server: {baseDir: project_folder},
        notify:true,
        online: true,
        port: 3000,
    })
}

function scripts() {
	return src(jsSourceFiles)
        .pipe(concat('app.min.js')) // concatenate to one file
        .pipe(uglify()) // minify JavaScript
        .pipe(strip()) // remove comments
        .pipe(dest(path.build.js)) 
	    .pipe(browserSync.stream()) // trigger Browsersync
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webpHtml())
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true}))
        .pipe(dest(path.build.html))

        // .pipe(src(path.build.html))
        // .pipe(inlinesource(path.watch.html))
        // .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}))
}

function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                interlanced: true,
                optimisationLevel: 7 // 0 to 7
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browserSync.reload({stream: true}))
}


function css() {
    return src(path.src.css)
        .pipe (
            sass({
                outputStyle: "expended"
            })
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 10 versions'],
                grid: true 
            })
        )
        // .pipe(webpCss())
        .pipe(groupCssMediaQueries())
        .pipe(cleanCss())
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream()) // trigger Browsersync
}

function clean() {

    return del(path.del, { force: true });
}

function watchFiles() {
    browser_sync();
    watch(path.watch.html, html);
    watch(path.watch.js, scripts);
    watch(path.watch.css, css);
    watch(path.watch.img, images);
}

function inlineCss() {
    return src(project_folder + '*.html')
        .pipe(inlinesource())
        .pipe(dest(path.build.html))
}

function removeUnusedCss() {
    return src(path.build.css + '*.css')
        .pipe(uncss({
            html: [path.build.html + '*.html']
        }))
        .pipe(dest(path.build.css))
}


let build = series(clean, parallel(css, html, scripts, images));
let production = series(removeUnusedCss, inlineCss);


exports.build = build;
exports.production = production;

exports.default = series( build, watchFiles);