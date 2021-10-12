function sendCoverage(callback) {
  var coverageData = window.__coverage__;

  if (coverageData === undefined) {
    return false; // no opt if there is no coverage data
  }

  var data = JSON.stringify(coverageData || {});

  var request = new XMLHttpRequest();
  request.open('POST', '/write-coverage');
  request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  request.responseType = 'json';
  request.send(data);

  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      handleCoverageResponse(this, callback);
    }
  };
}

if (typeof Testem !== "undefined" && Testem.afterTests) {
  Testem.afterTests(function(config, data, callback) {
    sendCoverage(callback);
  });
} else if (typeof QUnit !== "undefined") {
  QUnit.done(function() {
    sendCoverage();
  });
} else if (typeof Mocha !== "undefined" && typeof after !== "undefined") {
  after(function(done) {
    sendCoverage(done);
  });
} else {
  console.warn('No testing framework found for ember-cli-code-coverage to integrate with.');
}

function handleCoverageResponse(xhr, callback) {
  var data = xhr.response;

  if (data) {
    var results = ['Lines', 'Branches', 'Functions', 'Statements']
    .filter(function (name) {
      return name.toLowerCase();
    })
    .map(function (name) {
      return name + ' ' + data[name.toLowerCase()].pct + '%'
    });

    var resultsText = document.createTextNode(results.join(' | '));
    var element = document.createElement('div');
    element.style = 'background-color: white; color: black; border: 2px solid black; padding: 1em;position: fixed; left: 15px; bottom: 15px';
    element.appendChild(resultsText);
    document.body.appendChild(element);
  }

  if (callback) {
    callback();
  }
}
