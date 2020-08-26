import gulp from 'gulp';
import sass from 'gulp-sass';
import yargs from 'yargs';
import cleanCSS from 'gulp-clean-css';
import webpack from 'webpack-stream';
import named from 'vinyl-named';

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
    }
}

// gulp task for css styles compiling
export const styles = () => {
    return gulp.src(paths.styles.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(paths.styles.dest))
}

export const scripts = () => {
    return gulp.src(paths.scripts.src)
        .pipe(named())
        .pipe(webpack({
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

// gulp task for wathcing file changes
export const watch = () => {
    gulp.watch('src/assets/scss/**/*.scss', styles);
    gulp.watch('src/assets/js/**/*.js', scripts);
}