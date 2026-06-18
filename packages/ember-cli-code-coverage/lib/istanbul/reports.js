'use strict';

const reports = require('istanbul-reports');

/**
 * Create an Istanbul report
 * @param {string | [string, object]} reporter - Reporter name or tuple of [name, options]
 * @returns {any}
 */
function createReport(reporter) {
  return Array.isArray(reporter)
    ? reports.create(reporter[0], reporter[1])
    : reports.create(reporter, {});
}

module.exports = { createReport };
