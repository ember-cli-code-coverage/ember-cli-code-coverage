let __require;

if (typeof __webpack_require__ !== 'undefined') {
  __require = __webpack_require__; // eslint-disable-line no-undef
}

// This function exists to force the evaluation of modules that might not get loaded during
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
export function forceModulesToBeLoaded() {
  // this should always be ran **after** the test suite is completed since
  // sometimes force calling modules can have side effects and invoking them
  // after the app has run can reduce problems that would arrise.
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

export function sendCoverage(callback) {
  return new Promise(function (resolve) {
    let coverageData = window.__coverage__; //eslint-disable-line no-undef

    if (coverageData === undefined) {
      if (callback) {
        callback();
      }

      return resolve(); // do nothing if there is no coverage data
    }

    let data = JSON.stringify(coverageData || {});

    let request = new XMLHttpRequest(); //eslint-disable-line no-undef
    request.open('POST', '/write-coverage');
    request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    request.responseType = 'json';
    request.send(data);

    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        writeCoverageInfo(request.response);

        if (callback) {
          callback();
        }

        resolve(coverageData);
      }
    };
  });
}

function writeCoverageInfo(data) {
  if (data) {
    let results = ['Lines', 'Branches', 'Functions', 'Statements']
      .filter((name) => name.toLowerCase())
      .map((name) => name + ' ' + data[name.toLowerCase()].pct + '%');

    //eslint-disable-next-line no-undef
    let resultsText = document.createTextNode(results.join(' | '));
    //eslint-disable-next-line no-undef
    let element = document.createElement('div');
    element.style =
      'background-color: white; color: black; border: 2px solid black; padding: 1em;position: fixed; left: 15px; bottom: 15px';
    element.appendChild(resultsText);
    //eslint-disable-next-line no-undef
    document.body.appendChild(element);
  }
}
