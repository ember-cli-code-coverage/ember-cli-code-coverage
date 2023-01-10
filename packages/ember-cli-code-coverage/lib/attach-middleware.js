'use strict';

const bodyParser = require('body-parser').json({ limit: '500mb' });
const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');
const getConfig = require('./config');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs-extra');

const WRITE_COVERAGE = '/write-coverage';

function logError(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

/*
 * This function normalizes the relativePath to match what we get from a classical app. Its goal
 * is to change any in repo paths like: app-namespace/lib/in-repo-namespace/components/foo.js to
 * in-repo-namespace/components/foo.js.
 */
function normalizeRelativePath(root, filepath) {
  let embroiderTmpPathRegex = /embroider\/.{6}/gm;
  let relativePath = filepath.split(embroiderTmpPathRegex)[1].slice(1);

  if (fs.existsSync(path.join(root, 'package.json'))) {
    let pkgJSON = fs.readJsonSync(path.join(root, 'package.json'));
    let inRepoPaths =
      (pkgJSON['ember-addon'] && pkgJSON['ember-addon']['paths']) || [];

    for (let i = 0; i <= inRepoPaths.length; i++) {
      // this regex checks that the relative path is: app-namespace/path/to/inrepo
      let inRepoPathRegex = new RegExp('[^/]+/' + inRepoPaths[i], 'gi');
      if (inRepoPathRegex.test(relativePath)) {
        relativePath = path.join(
          inRepoPaths[i].split(path.sep).slice(-1)[0],
          filepath.split(inRepoPaths[i])[1]
        );
        break;
      } else if (relativePath.startsWith(inRepoPaths[i])) {
        // this checks if relative path is: /path/to/inrepo
        relativePath = path.join(
          inRepoPaths[i].split(path.sep).slice(-1)[0],
          filepath.split(inRepoPaths[i])[1]
        );
        break;
      }
    }
  }

  return relativePath;
}

/*
 * The objective of this function is to convert an absolute path into a path relative to project root.
 * The is because the coverage html file wants to display things like `app/components/foo.js`
 *  and not a full absolute path. The trick is that this path will be different in Embroider vs Classic. For
 * Embroider this path will be in the temp location such as:
 * `/private/var/folders/61/n399scw50nq264twrz32ccgr000vkn/T/embroider/fbeb74/ember-test-app/components/foo.js`
 * where as in Classic it will be the "actual" app like: `/Users/x/y/z/ember-test-app/ember-test-app/components/foo.js`
 * both of these absolute paths should be converted into `app/components/foo.js`
 */
function adjustCoverageKey(
  root,
  filepath,
  namespaceMappings,
  modifyAssetLocation
) {
  let relativePath = path.relative(root, filepath);
  let embroiderTmpPathRegex = /embroider\/.{6}/gm;

  // we can determine if file is coming from embroider based on how the path looks
  if (embroiderTmpPathRegex.test(filepath)) {
    relativePath = normalizeRelativePath(root, filepath);
  }

  let namespace = relativePath.split(path.sep)[0];
  let pathWithoutNamespace = relativePath.split(path.sep).slice(1);
  let namespaceKey = namespace;

  if (pathWithoutNamespace[0] === 'test-support') {
    namespaceKey = path.join(namespace, 'test-support');
    // remove the old test-support segment
    pathWithoutNamespace = pathWithoutNamespace.slice(1);
  }

  if (modifyAssetLocation) {
    let customPath = modifyAssetLocation(
      root,
      relativePath,
      filepath,
      namespaceMappings
    );

    if (customPath) {
      return customPath;
    }
  }

  if (namespaceMappings.has(namespaceKey)) {
    return path.join(
      ...[namespaceMappings.get(namespaceKey), ...pathWithoutNamespace]
    );
  }

  // use the default key which will point to project root. this should only
  // happen in embroider under special situations
  namespaceKey = '/';
  return path.join(namespaceMappings.get(namespaceKey), relativePath);
}

function adjustCoverage(coverage, options) {
  let { root, namespaceMappings, configPath } = options;
  let { modifyAssetLocation } = getConfig(configPath);

  const adjustedCoverage = Object.keys(coverage).reduce((memo, filePath) => {
    let relativeToProjectRoot = adjustCoverageKey(
      root,
      filePath,
      namespaceMappings,
      modifyAssetLocation
    );
    coverage[filePath].path = path.relative(root, relativeToProjectRoot);
    memo[path.relative(root, relativeToProjectRoot)] = coverage[filePath];
    return memo;
  }, {});

  return adjustedCoverage;
}

function writeCoverage(coverage, options, map) {
  let { root } = options;
  const adjustedCoverage = adjustCoverage(coverage, options);

  Object.entries(adjustedCoverage).forEach(([relativePath, cov]) => {
    // this filters out files that dont reside within the project
    if (fs.existsSync(path.join(root, relativePath))) {
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
}

module.exports = {
  serverMiddleware,
  testMiddleware,
  adjustCoverageKey,
  adjustCoverage,
  normalizeRelativePath,
};
