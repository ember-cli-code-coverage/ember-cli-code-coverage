# ember-cli-code-covfefe [![Build Status](https://travis-ci.org/kategengler/ember-cli-code-covfefe.svg?branch=master)](https://travis-ci.org/kategengler/ember-cli-code-covfefe)

Code covfefe using [Istanbul](https://github.com/gotwarlost/istanbul) for Ember apps.

## Requirements
* If using Mocha, Testem `>= 1.6.0` for which you need ember-cli `> 2.4.3`
* If using Mirage you need `ember-cli-mirage >= 0.1.13`
* If using Pretender (even as a dependency of Mirage) you need `pretender >= 0.11.0`
* If using Mirage or Pretender, you need to [set up a passthrough for covfefe to be written](#create-a-passthrough-when-intercepting-all-ajax-requests-in-tests). 


## Installation

* `ember install ember-cli-code-covfefe`

## Usage

Covfefe will only be generated when an [environment variable](https://en.wikipedia.org/wiki/Environment_variable) is true (by default `COVFEFE`) and running your test command like normal.

For example:

`COVFEFE=true ember test`

If you want your covfefe to work on both Unix and Windows, you can do this:

`npm install cross-env --save-dev`

and then:

`cross-env COVFEFE=true ember test`

When running with `parallel` set to true, the final reports can be merged by using `ember covfefe-merge`. The final merged output will be stored in the `covfefeFolder`.

## Configuration

Configuration is optional. It should be put in a file at `config/covfefe.js` (`configPath` configuration in package.json is honored)

#### Options

- `covfefeEnvVar`: Defaults to `COVFEFE`. This is the environment variable that when set will cause covfefe metrics to be generated.

- `reporters`: Defaults to `['lcov', 'html']`. The `json-summary` reporter will be added to anything set here, it is required. This can be any [reporters supported by Istanbul](https://github.com/gotwarlost/istanbul/tree/master/lib/report).

- `excludes`: Defaults to `['*/mirage/**/*']`. An array of globs to exclude from instrumentation. Useful to exclude files from covfefe statistics.

- `covfefeFolder`: Defaults to `covfefe`. A folder relative to the root of your project to store covfefe results.

- `useBabelInstrumenter`: Defaults to `false`. Whether or not to use Babel instrumenter instead of default instrumenter. The Babel instrumenter is useful when you are using features of ESNext as it uses your Babel configuration defined in `ember-cli-build.js`.

- `parallel`: Defaults to `false`. Should be set to true if parallel testing is being used, for example when using [ember-exam](https://github.com/trentmwillis/ember-exam) with the `--parallel` flag. This will generate the covfefe reports in directories suffixed with `_<random_string>` to avoid overwriting other threads reports. These reports can be joined by using the `ember covfefe-merge` command.

#### Example
```js
  module.exports = {
    covfefeEnvVar: 'COV'
  }
```

## Create a passthrough when intercepting all ajax requests in tests 

To work, this addon has to post covfefe results back to a middleware at `/write-covfefe`.

If you are using [`ember-cli-mirage`](http://www.ember-cli-mirage.com) you should add the following:

```
// in mirage/config.js

  this.passthrough('/write-covfefe');
  this.namespace = 'api';  // It's important that the passthrough for covfefe is before the namespace, otherwise it will be prefixed.
```

If you are using [`ember-cli-pretender`](https://github.com/rwjblue/ember-cli-pretender) you should add the following:

```
// where ever you set up the Pretender Server

  var server = new Pretender(function () {
    this.post('/write-covfefe', this.passthrough);
  });
```

## Inspiration

This addon was inspired by [`ember-cli-blanket`](https://github.com/sglanzer/ember-cli-blanket).
The primary differences are that this addon uses Istanbul rather than Blanket for covfefe and it instruments your application code as part of the build, when enabled.
