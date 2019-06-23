/**
 * Packages node utilisés
 */
const
    gulp            = require('gulp'),
    autoprefixer    = require('gulp-autoprefixer'),
    babel           = require('gulp-babel'),
    sass            = require('gulp-sass'),
    concat          = require('gulp-concat'),
    rename          = require('gulp-rename'),
    uglify          = require('gulp-uglify'),
    livereload      = require('gulp-livereload'),
    pixrem          = require('gulp-pixrem')


process.setMaxListeners(0)


/**
 * Définitions des variables pour le chemin
 */
const path = {
        inputs: {
            styles: "dev/style/*.sass",
            js: "dev/script/",
        },
        outputs: {
            styles: "assets/style/",
            js: "assets/script/",
        }
    }


/**
 * Initialisation des tâches
 */
// SASS
gulp.task('styles', gulp.series( () =>

    gulp.src(path.inputs.styles)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(pixrem({atrules:true}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.outputs.styles))
        .pipe(livereload())
    )
)

// VENDORS
gulp.task('vendors-js', gulp.series( () =>

    gulp.src(path.inputs.js + 'vendors/*.js')
        .pipe(concat('vendors.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.outputs.js))
        .pipe(livereload())
    )
)

// JS lors du dévelopement
gulp.task('app-js', gulp.series( () =>

    gulp.src(path.inputs.js + 'app/*.js')
        // .pipe(babel({presets: ['es2015']}))
        .pipe(concat('app.min.js'))
        // .pipe(uglify())
        .pipe(gulp.dest(path.outputs.js))
        .pipe(livereload())
    )
)

/**
 * Définition des watchers
 */
gulp.task('watch', gulp.series(() => {

    livereload.listen()

    gulp.watch(path.inputs.styles, gulp.series(['styles'] ))

    gulp.watch(path.inputs.js + 'vendors/*.js', gulp.series(['vendors-js'] ))

    gulp.watch(path.inputs.js + 'app/*.js', gulp.series( ['app-js'] ))
}))

gulp.task('default', gulp.series(['styles', 'vendors-js', 'app-js']))


/**
 * Si erreur pour ne pas que le gulp s'arrête
 */
function swallowError(error) {
    console.log(error.toString())
    this.emit('end')
}