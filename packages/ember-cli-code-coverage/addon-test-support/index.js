let __require;

if (typeof __webpack_require__ !== 'undefined') {
  __require = __webpack_require__;
}

export function forceModulesToBeLoaded() {
  // check if webpack is present
  if (typeof __webpack_require__ !== 'undefined') {
    let __modules = __require.m;
    Object.keys(__modules).forEach(moduleName => {
      if (!moduleName.startsWith('../') && !moduleName.startsWith('./node_modules/')) {
        __require(moduleName);
      }
    });
  }

  Object.keys(window.requirejs.entries).forEach(moduleName => {
    try {
      let excludeTestModules = /^[^/]+\/tests\//;

      // this causes an infinite loop without it
      if (!excludeTestModules.test(moduleName)) {
        require(moduleName);
      }
    } catch (error) {
      console.warn('Error occurred while evaluating `' + moduleName + '`: ' + error.message + '\n' + error.stack);
    }
  });
}