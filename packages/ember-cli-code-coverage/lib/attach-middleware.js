'use strict';

const bodyParser = require('body-parser').json({ limit: '50mb' });
const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');
const getConfig = require('./config');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const fs = require('fs-extra');

const WRITE_COVERAGE = '/write-coverage';

function logError(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

/*
 * this function tries to check if a given relative path resides within an in repo
 * addon or engine. most of the special logic within this function is attempting
 * to translate a relateive namespaced path (ie is missing app or addon) such as
 * lib/hello/components/world.js to lib/hello/addon/components/world.js
 */
function isRelativeToInRepoAddon(root, inRepoAddons, relativePath) {
  let relativePathParts = relativePath.split(path.sep);

  for (let i = 0; i < inRepoAddons.length; i++) {
    let inRepoPathParts = inRepoAddons[i].split(path.sep);

    // check if in repo addon at 'lib/hello' matches 'hello/components/world.js'
    // this case is for classic and we match on the last part of the in repo path
    // matches the first part of the relative path
    if (inRepoPathParts[inRepoPathParts.length - 1] === relativePathParts[0]) {
      if (relativePathParts[1] === 'test-support') {
        return path.join(
          inRepoAddons[i],
          'addon-test-support',
          ...relativePathParts.slice(2)
        );
      }

      return path.join(inRepoAddons[i], 'addon', ...relativePathParts.slice(1));
    }

    // under embroider relative path will be lib/hello/components/world.js
    // which we can simply check that its path starts with a known in repo
    // path.
    if (relativePath.startsWith(inRepoAddons[i])) {
      if (
        relativePathParts[2] === '_app_' ||
        relativePathParts[2] === 'test-support'
      ) {
        relativePathParts.splice(2, 1);
        return path.join(
          inRepoAddons[i],
          relativePathParts[2] === '_app_' ? 'app' : 'addon-test-support',
          path.relative(inRepoAddons[i], relativePathParts.join(path.sep))
        );
      }

      return path.join(
        inRepoAddons[i],
        'addon',
        path.relative(inRepoAddons[i], relativePath)
      );
    }

    // here we check if we can find an app export from within an inrepo that matches the
    // relative path such as app-name/components/world.js or dummy/components/world.js and
    // map that to the expected location within the in-repo addon.
    let pathWithOutAppName = relativePath
      .split(path.sep)
      .slice(1)
      .join(path.sep);
    let relativePathOfAppExport = path.join(
      inRepoAddons[i],
      'app',
      pathWithOutAppName
    );

    let foundInRepo = fs.existsSync(path.join(root, relativePathOfAppExport));
    let foundInApp = fs.existsSync(path.join(root, 'app', pathWithOutAppName));

    if (foundInRepo && !foundInApp) {
      return relativePathOfAppExport;
    }
  }

  return false;
}

/*
 * The objective of this function is to covert an absolute path into a path relative to project root.
 * The is because the coverage html file wants to display things like `app/components/foo.js`
 *  and not a full absolute path. The trick is that this path will be different in Embroider vs Classic. For
 * Embroider this path will be in the temp location such as:
 * `/private/var/folders/61/n399scw50nq264twrz32ccgr000vkn/T/embroider/fbeb74/ember-test-app/components/foo.js`
 * where as in Classic it will be the "actual" app like: `/Users/x/y/z/ember-test-app/ember-test-app/components/foo.js`
 * both of these absolute paths should be converted into `app/components/foo.js`
 */
function adjustCoverageKey(root, filepath, isAddon) {
  let pkgJSON = {};
  if (fs.existsSync(path.join(root, 'package.json'))) {
    pkgJSON = fs.readJsonSync(path.join(root, 'package.json'));
  }
  let inRepoPaths =
    (pkgJSON['ember-addon'] && pkgJSON['ember-addon']['paths']) || [];
  let embroiderTmpPathRegex = /embroider\/.{6}\/[^/]+/gm;

  // we can check if embroider based on how the path looks.
  if (embroiderTmpPathRegex.test(filepath)) {
    let relativePath = filepath.split(embroiderTmpPathRegex)[1].slice(1);
    let adjustedPath = isRelativeToInRepoAddon(root, inRepoPaths, relativePath);

    if (adjustedPath) {
      return adjustedPath;
    }

    return path.join('app', relativePath);
  }

  // handle a classic filepath
  let relativePath = path.relative(root, filepath);
  let adjustedPath = isRelativeToInRepoAddon(root, inRepoPaths, relativePath);

  if (adjustedPath) {
    return adjustedPath;
  }

  if (isAddon && !relativePath.startsWith('dummy')) {
    // changes ember-test-addon/component/foo.js to addon/component/foo.js
    return path.join('addon', ...relativePath.split(path.sep).slice(1));
  }

  // changes dummy/component/foo.js to app/component/foo.js in addons
  // changes app-name/component/foo.js to app/component/foo.js in classic apps
  return path.join('app', ...relativePath.split(path.sep).slice(1));
}

/*
 * because we only want to track from the perspective of the
 * app and not the app namespace (this can include other things that have
 * been merged in normally). This simply verifies that a file
 * actually originiates within the project and not from another addon or
 * something builtin.
 */
function filterNonAppOwnedFiles(root, key) {
  if (fs.existsSync(path.join(root, key))) {
    return true;
  }

  return false;
}

function adjustCoverage(coverage, options) {
  let { root, isAddon } = options;
  const adjustedCoverage = Object.keys(coverage).reduce((memo, filePath) => {
    let relativeToProjectRoot = adjustCoverageKey(root, filePath, isAddon);
    coverage[filePath].path = relativeToProjectRoot;
    memo[relativeToProjectRoot] = coverage[filePath];
    return memo;
  }, {});

  return adjustedCoverage;
}

function writeCoverage(coverage, options, map) {
  let { root } = options;
  const adjustedCoverage = adjustCoverage(coverage, options);

  Object.entries(adjustedCoverage).forEach(([key, cov]) => {
    if (filterNonAppOwnedFiles(root, key)) {
      map.addFileCoverage(cov);
    }
  });
}

function reportCoverage(map, root, configPath) {
  let config = getConfig(configPath);

  let { reporters } = config;

  if (config.parallel) {
    config.coverageFolder =
      config.coverageFolder + '_' + crypto.randomBytes(4).toString('hex');

    if (!reporters.includes('json')) {
      reporters.push('json');
    }
  }

  if (!reporters.includes('json-summary')) {
    reporters.push('json-summary');
  }

  // create a context for report generation
  let context = libReport.createContext({
    dir: path.join(root, config.coverageFolder),
    watermarks: libReport.getDefaultWatermarks(),
    coverageMap: map,
  });

  reporters.forEach((reporter) => {
    let report = reports.create(reporter, {});

    // call execute to synchronously create and write the report to disk
    report.execute(context);
  });
}

function coverageHandler(map, options, req, res) {
  writeCoverage(req.body, options, map);
  reportCoverage(map, options.root, options.configPath);

  res.send(map.getCoverageSummary().toJSON());
}

// Used when app is in dev mode (`ember serve`).
// Creates a new coverage map on every request.
function serverMiddleware(app, options) {
  app.post(
    WRITE_COVERAGE,
    bodyParser,
    (req, res) => {
      let map = libCoverage.createCoverageMap();

      coverageHandler(map, options, req, res);
    },
    logError
  );

  app.use('/coverage.js', express.static(path.join(__dirname, 'coverage.js')));
}

// Used when app is in ci mode (`ember test`).
// Collects the coverage on each request and merges it into the coverage map.
function testMiddleware(app, options) {
  let map = libCoverage.createCoverageMap();

  app.post(
    WRITE_COVERAGE,
    bodyParser,
    (req, res) => {
      coverageHandler(map, options, req, res);
    },
    logError
  );

  app.use('/coverage.js', express.static(path.join(__dirname, 'coverage.js')));
}

module.exports = {
  serverMiddleware,
  testMiddleware,
  adjustCoverageKey,
  isRelativeToInRepoAddon,
  filterNonAppOwnedFiles,
  adjustCoverage,
};
