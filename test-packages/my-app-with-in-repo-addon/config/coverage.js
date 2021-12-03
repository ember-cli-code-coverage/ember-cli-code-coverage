const fs = require('fs');
const path = require('path');

module.exports = {
  reporters: ['lcov', 'html', 'text', 'json-summary'],

  modifyAssetLocation(root, relativePath) {
    let appPath = relativePath.replace('my-app-with-in-repo-addon', 'app');

    if (!fs.existsSync(appPath) && fs.existsSync(path.join(root, 'lib', 'my-in-repo-addon', appPath))) {
      return path.join('lib', 'my-in-repo-addon', appPath);
    }

    return false;
  }
};
