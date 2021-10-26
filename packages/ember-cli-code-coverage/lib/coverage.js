function sendCoverage(callback) {
  var coverageData = window.__coverage__; //eslint-disable-line no-undef

  if (coverageData === undefined) {
    return callback(); // no opt if there is no coverage data
  }

  var data = JSON.stringify(coverageData || {});

  var request = new XMLHttpRequest(); //eslint-disable-line no-undef
  request.open('POST', '/write-coverage');
  request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  request.responseType = 'json';
  request.send(data);

  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      handleCoverageResponse(this, callback);
    }
  };
}

//eslint-disable-next-line no-undef
if (typeof Testem !== 'undefined' && Testem.afterTests) {
  //eslint-disable-next-line no-undef
  Testem.afterTests(function (config, data, callback) {
    sendCoverage(callback);
  });
} else if (typeof QUnit !== 'undefined') {
  //eslint-disable-next-line no-undef
  QUnit.done(function () {
    sendCoverage();
  });
} else if (typeof Mocha !== 'undefined' && typeof after !== 'undefined') {
  //eslint-disable-next-line no-undef
  after(function (done) {
    sendCoverage(done);
  });
} else {
  console.warn(
    'No testing framework found for ember-cli-code-coverage to integrate with.'
  );
}

function handleCoverageResponse(xhr, callback) {
  var data = xhr.response;

  if (data) {
    var results = ['Lines', 'Branches', 'Functions', 'Statements']
      .filter((name) => name.toLowerCase())
      .map((name) => name + ' ' + data[name.toLowerCase()].pct + '%');

    //eslint-disable-next-line no-undef
    var resultsText = document.createTextNode(results.join(' | '));
    //eslint-disable-next-line no-undef
    var element = document.createElement('div');
    element.style =
      'background-color: white; color: black; border: 2px solid black; padding: 1em;position: fixed; left: 15px; bottom: 15px';
    element.appendChild(resultsText);
    //eslint-disable-next-line no-undef
    document.body.appendChild(element);
  }

  if (callback) {
    callback();
  }
}
