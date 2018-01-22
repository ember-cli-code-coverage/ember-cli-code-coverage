'use strict';

const generateChangelog = require('ember-cli-changelog/lib/tasks/release-with-changelog');

module.exports = {
  publish: true,
  beforeCommit: generateChangelog
};
