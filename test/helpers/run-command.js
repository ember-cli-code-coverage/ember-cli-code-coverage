var RSVP = require('rsvp');
var spawn = require('child_process').spawn;

module.exports = function runCommand(command, args, opts) {
  opts = opts || {};

  opts.stdio = opts.stdio || 'inherit';

  var newENV = {};
  var item, envOption;

  for (item in process.env) {
    newENV[item] = process.env[item];
  }
  for (envOption in opts.env) {
    newENV[envOption] = opts.env[envOption];
  }

  opts.env = newENV;

  return new RSVP.Promise(function(resolve, reject) {
    var p = spawn(command, args, opts);
    p.on('close', function(code) {
      if (code !== 0) {
        reject(new Error('Command ' + command + ' ' + args.join(' ') + ' exited ' + code));
      } else {
        resolve();
      }
    });
  });
};
