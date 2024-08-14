const reports = require('istanbul-reports');

function createReport(reporter) {
  return Array.isArray(reporter)
    ? reports.create(reporter[0], reporter[1])
    : reports.create(reporter, {});
}

module.exports = {
  createReport,
};
