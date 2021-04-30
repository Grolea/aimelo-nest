'use strict';
const { task, src, dest, series } = require('gulp');
const { readdirSync, statSync } = require('fs');
const { join, resolve } = require('path');
const { promisify } = require('util');
const { createProject } = require('gulp-typescript');
const childProcess = require('child_process');
const clean = require('gulp-clean');
const deleteEmpty = require('delete-empty');

function isDirectory(path) {
    return statSync(path).isDirectory();
}

function getFolders(dir) {
    return readdirSync(dir).filter(file => isDirectory(join(dir, file)));
}

function getDirs(base) {
    return getFolders(base).map(path => `${base}/${path}`);
}

const source = 'packages';
const samplePath = 'sample';
const packagePaths = getDirs(source);
const packages = {
    common: createProject('packages/common/tsconfig.json'),
    boot: createProject('packages/common/tsconfig.json'),
};

function copyMisc() {
    const miscFiles = src(['README.md', 'LICENSE', '.npmignore']);
    return packagePaths.reduce((stream, packagePath) => stream.pipe(dest(packagePath)), miscFiles);
}

task('copy-misc', copyMisc);

function cleanOutput() {
    return src([`${source}/**/*.js`, `${source}/**/*.d.ts`, `${source}/**/*.js.map`, `${source}/**/*.d.ts.map`], {
        read: false,
    }).pipe(clean());
}

function cleanDirs(done) {
    deleteEmpty.sync(`${source}/`);
    done();
}

task('clean:output', cleanOutput);
task('clean:dirs', cleanDirs);
task('clean:bundle', series('clean:output', 'clean:dirs'));

const modules = Object.keys(packages);

const distId = process.argv.indexOf('--dist');
const dist = distId < 0 ? source : process.argv[distId + 1];

/**
 * Watches the packages/* folder and
 * builds the package on file change
 */
function defaultTask() {
    log.info('Watching files..');
    modules.forEach(packageName => {
        watch([`${source}/${packageName}/**/*.ts`, `${source}/${packageName}/*.ts`], series(packageName));
    });
}

/**
 * Builds the given package
 * @param packageName The name of the package
 */
function buildPackage(packageName) {
    console.log(`${dist}/${packageName}`);
    return packages[packageName]
        .src()
        .pipe(packages[packageName]())
        .pipe(dest(`${dist}/${packageName}`));
}

/**
 * Builds the given package and adds sourcemaps
 * @param packageName The name of the package
 */
function buildPackageDev(packageName) {
    return packages[packageName]
        .src()
        .pipe(sourcemaps.init())
        .pipe(packages[packageName]())
        .pipe(sourcemaps.mapSources(sourcePath => './' + sourcePath.split('/').pop()))
        .pipe(sourcemaps.write('.', {}))
        .pipe(dest(`${dist}/${packageName}`));
}

modules.forEach(packageName => {
    task(packageName, () => buildPackage(packageName));
    task(`${packageName}:dev`, () => buildPackageDev(packageName));
});

task('common:dev', series(modules.map(packageName => `${packageName}:dev`)));
task('build', series(modules));
task('build:dev', series('common:dev'));
task('default', defaultTask);

function move() {
    const samplesDirs = getDirs(samplePath);
    const distFiles = src([`${dist}/**/*`]);
    return samplesDirs.reduce((distFile, dir) => distFile.pipe(dest(join(dir, '`${dist}'))), distFiles);
}

task('move', move);

const exec = promisify(childProcess.exec);

async function executeYarnScriptInSamples(script, appendScript) {
    const directories = getDirs(samplePath);

    for await (const dir of directories) {
        const dirName = dir.replace(resolve(__dirname, '../../../'), '');
        log.info(`Running ${clc.blue(script)} in ${clc.magenta(dirName)}`);
        try {
            const result = await exec(`${script} --prefix ${dir} ${appendScript ? '-- ' + appendScript : ''}`);
            log.info(`Finished running ${clc.blue(script)} in ${clc.magenta(dirName)}`);
            if (result.stderr) {
                log.error(result.stderr);
            }
            if (result.stdout) {
                log.error(result.stdout);
            }
        } catch (err) {
            log.error(`Failed running ${clc.blue(script)} in ${clc.magenta(dirName)}`);
            if (err.stderr) {
                log.error(err.stderr);
            }
            if (err.stdout) {
                log.error(err.stdout);
            }
            process.exit(1);
        }
    }
}

task('install:samples', async () => executeYarnScriptInSamples('yarn ci --no-audit --prefer-offline --no-shrinkwrap'));
task('build:samples', async () => executeYarnScriptInSamples('yarn run build'));
task('test:samples', async () => executeYarnScriptInSamples('yarn run test', '--passWithNoTests'));
task('test:e2e:samples', async () => executeYarnScriptInSamples('yarn run test:e2e', '--passWithNoTests'));
