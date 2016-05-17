var path = require('path');

module.exports = {
  fixPath: function(relativePath, app) {
    var srcDir = path.normalize(relativePath).split(path.sep)[0];
    var destDir = app.constructor.name === 'EmberApp' ? 'app' : 'addon';

    return relativePath.replace(srcDir, destDir);
  }
};
