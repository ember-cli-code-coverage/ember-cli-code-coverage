//
// This file exists to force the evaluation of modules that might not get loaded during
// the normal flow of your application and thus would not show up in the coverage report. This is needed
// because the istanbul plugin simply traverses a file and inserts counters over all lines of code
// such as: (the following is sudo code that is not exactly correct but illustrates that point)
//
// define('my-app/foo', function() {
//   window.counter++;
//   return 'bar';
// });
//
// This counter will never happen unless this module gets evaluated and if you do not "pull" on this
// module from somewhere it will be as if it doesnt exists from the code coverage point of view. This
// file will makes sure all modules (including those from webpack where Emboider will place some) get
// evaluated by actually requiring them.
//
let __require;

if (typeof __webpack_require__ !== 'undefined') {
  __require = __webpack_require__; // eslint-disable-line no-undef
}

export function forceModulesToBeLoaded() {
  if (typeof __webpack_require__ !== 'undefined') {
    let __modules = __require.m;
    Object.keys(__modules).forEach((moduleName) => {
      if (
        !moduleName.startsWith('../') &&
        !moduleName.startsWith('./node_modules/')
      ) {
        try {
          __require(moduleName);
        } catch (error) {
          console.warn(
            `Error occurred while evaluating '${moduleName}': ${error.message}\n${error.stack}`
          );
        }
      }
    });
  }

  Object.keys(window.requirejs.entries).forEach((moduleName) => {
    try {
      // do no require itself as it will cause a recursive loop
      let excludeTestModules = /^[^/]+\/tests\//;
      if (!excludeTestModules.test(moduleName)) {
        require(moduleName); // eslint-disable-line no-undef
      }
    } catch (error) {
      console.warn(
        `Error occurred while evaluating '${moduleName}': ${error.message}\n${error.stack}`
      );
    }
  });
}
