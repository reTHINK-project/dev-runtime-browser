var gulp = require('gulp');
var exec = require('child_process').exec;

// Gulp task to generate development documentation;
gulp.task('doc', function(done) {

  console.log('Generating documentation...');
  exec('node_modules/.bin/jsdoc -R readme.md -d docs src/*', function(err, stdout, stderr) {
    if (err) return done(err);
    console.log('Documentation generated in "docs" directory');
    done();
  });

});

// Task and dependencies to distribute for all environments;
var babel = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var replace = require('gulp-replace');
var insert = require('gulp-insert');
var uglify = require('gulp-uglify');
var bump = require('gulp-bump');

var pkg = require('./package.json');

gulp.task('dist', function() {

  var bundler = browserify('./src/runtime-core.js', {
    standalone: 'runtime-core', debug: false}).transform(babel);

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) {
        console.error(err);
        this.emit('end');
      })
      .pipe(source('runtime-core.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(insert.prepend('// Runtime User Agent \n\n// version: {{version}}\n\n'))
      .pipe(replace('{{version}}', pkg.version))
      .pipe(gulp.dest('./dist'));
  }

  rebundle();

});

gulp.task('build-hyperties', function() {

  function rebundle(filename) {

    filename.forEach(function(filename) {
      var bundler = browserify('./src/hyperties/' + filename + '.js', {
        standalone: filename,
        debug: true}).transform(babel);
      console.log('bundle hyperty', filename);
      bundler.bundle()
        .on('error', function(err) {
          console.error(err);
          this.emit('end');
        })
        .pipe(source(filename + '.js'))
        .pipe(gulp.dest('./dist'));
    });

  }

  rebundle(['HypertyHello']);

});

/**
 * Bumping version number and tagging the repository with it.
 * Please read http://semver.org/
 *
 * You can use the commands
 *
 *     gulp patch     # makes v0.1.0 → v0.1.1
 *     gulp feature   # makes v0.1.1 → v0.2.0
 *     gulp release   # makes v0.2.1 → v1.0.0
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 */
function inc(importance) {
  // get all the files to bump version in
  return gulp.src(['./package.json'])

    // bump the version number in those files
    .pipe(bump({type: importance}))

    // save it back to filesystem
   .pipe(gulp.dest('./'));
}

gulp.task('patch', function() { return inc('patch'); });

gulp.task('feature', function() { return inc('minor'); });

gulp.task('release', function() { return inc('major'); });
