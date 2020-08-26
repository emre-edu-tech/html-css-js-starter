import gulp from 'gulp';
import sass from 'gulp-sass';
import yargs from 'yargs';
import cleanCSS from 'gulp-clean-css';
import webpack from 'webpack-stream';
import named from 'vinyl-named';
import gulpif from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';
import imagemin from 'gulp-imagemin';

const PRODUCTION = yargs.argv.prod;

const paths = {
    styles: {
        src: [
            'src/assets/scss/bundle.scss',
        ],
        dest: 'dist/assets/css',
    },
    scripts: {
        src: [
            'src/assets/js/bundle.js',
        ],
        dest: 'dist/assets/js',
    },
    images: {
        src: 'src/assets/images/**/*.{jpg,jpeg,png,svg,gif}',
        dest: 'dist/assets/images',
    },
}

// gulp task for css styles compiling
export const styles = () => {
    return gulp.src(paths.styles.src)
        .pipe(gulpif(!PRODUCTION, sourcemaps.init()))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulpif(PRODUCTION, cleanCSS({compatibility: 'ie8'})))
        .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
        .pipe(gulp.dest(paths.styles.dest));
}

export const scripts = () => {
    return gulp.src(paths.scripts.src)
        .pipe(named())
        .pipe(webpack({
            devtool: !PRODUCTION ? 'inline-source-map' : false,
            mode: PRODUCTION ? 'production' : 'development',
            output: {
                filename: 'bundle.js',
            },
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(gulp.dest(paths.scripts.dest));
}

// copy images from source to destination if it is production minify the images
export const copyImages = () => {
    return gulp.src(paths.images.src)
        .pipe(gulpif(PRODUCTION, imagemin()))
        .pipe(gulp.dest(paths.images.dest));
}

// gulp task for watching file changes
export const watch = () => {
    gulp.watch('src/assets/scss/**/*.scss', styles);
    gulp.watch('src/assets/js/**/*.js', scripts);
    gulp.watch(paths.images.src, copyImages);
}

// build for development without watch
export const build = (done) => {
    gulp.series(gulp.parallel(styles, scripts), copyImages)(done);
}

// build for development with watch
export const buildWatch = (done) => {
    gulp.series(gulp.parallel(styles, scripts), copyImages, watch)(done);
}

export default build;