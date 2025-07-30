import { helper } from '@ember/component/helper';

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
export function forceModulesToBeLoaded(filterFunction) {
  if (!filterFunction) {
    filterFunction = (type, module) => {
      if (type === 'webpack') {
        return (
          !module.startsWith('../') && !module.startsWith('./node_modules/')
        );
      }

      let excludeTestModules = /^[^/]+\/tests\//;
      return !excludeTestModules.test(module);
    };
  }

  // this should always be ran **after** the test suite is completed since
  // sometimes force calling modules can have side effects and invoking them
  // after the app has run can reduce problems that would arrise.
  if (typeof __webpack_require__ !== 'undefined') {
    let __modules = __require.m;
    Object.keys(__modules).forEach((moduleName) => {
      try {
        if (filterFunction('webpack', moduleName)) {
          __require(moduleName);
        }
      } catch (error) {
        console.warn(
          `Error occurred while evaluating '${moduleName}': ${error.message}\n${error.stack}`
        );
      }
    });
  }

  Object.keys(window.requirejs.entries).forEach((moduleName) => {
    try {
      if (filterFunction('require', moduleName)) {
        require(moduleName); // eslint-disable-line no-undef
      }
    } catch (error) {
      console.warn(
        `Error occurred while evaluating '${moduleName}': ${error.message}\n${error.stack}`
      );
    }
  });
}

export async function sendCoverage(callback) {
  let coverageData = window.__coverage__; //eslint-disable-line no-undef

  if (coverageData === undefined) {
    if (callback) {
      callback();
    }

    return; // do nothing if there is no coverage data
  }

  let body = JSON.stringify(coverageData || {});

  let response = await fetch('/write-coverage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });
  let responseData = await response.json();
  writeCoverageInfo(responseData);

  if (callback) {
    callback();
  }

  return responseData;
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

export const emberCliCodeCoverageIncrement = helper(
  function emberCliCodeCoverageIncrement(params, hash) {
    let { path, statement, branch, condition, action } = hash;

    if (action) {
      return function (...arg) {
        if (statement) {
          window.__coverage__[path].s[statement]++;
        }

        return params[0].call(this, ...arg);
      };
    }

    if (statement) {
      window.__coverage__[path].s[statement]++;
    }

    if (branch && condition != null) {
      window.__coverage__[path].b[branch][condition]++;
    }

    return params[0];
  }
);
