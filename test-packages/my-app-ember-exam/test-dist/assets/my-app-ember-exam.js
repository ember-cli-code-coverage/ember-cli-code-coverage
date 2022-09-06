'use strict';



;define("my-app-ember-exam/adapters/-json-api", ["exports", "@ember-data/adapter/json-api"], function (_exports, _jsonApi) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _jsonApi.default;
    }
  });

  function cov_2aw7w6q7nv() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/adapters/-json-api.js";
    var hash = "89983f184f3e48b5f522fbdc32086b5c514a0673";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/adapters/-json-api.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "89983f184f3e48b5f522fbdc32086b5c514a0673"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_2aw7w6q7nv = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_2aw7w6q7nv();
  0; //eaimeta@70e063a35619d71f0,"@ember-data/adapter/json-api"eaimeta@70e063a35619d71f
});
;define("my-app-ember-exam/app", ["exports", "ember-resolver", "ember-load-initializers", "my-app-ember-exam/config/environment"], function (_exports, _emberResolver, _emberLoadInitializers, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function cov_uputmd56i() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/app.js";
    var hash = "45ebb730f085c4267b16f2137cd381c6c24ac6b5";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/app.js",
      statementMap: {
        "0": {
          start: {
            line: 7,
            column: 17
          },
          end: {
            line: 7,
            column: 36
          }
        },
        "1": {
          start: {
            line: 8,
            column: 20
          },
          end: {
            line: 8,
            column: 42
          }
        },
        "2": {
          start: {
            line: 9,
            column: 13
          },
          end: {
            line: 9,
            column: 21
          }
        },
        "3": {
          start: {
            line: 12,
            column: 0
          },
          end: {
            line: 12,
            column: 43
          }
        }
      },
      fnMap: {},
      branchMap: {},
      s: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0
      },
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "45ebb730f085c4267b16f2137cd381c6c24ac6b5"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_uputmd56i = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_uputmd56i();
  0; //eaimeta@70e063a35619d71f0,"@ember/application",0,"ember-resolver",0,"ember-load-initializers",0,"my-app-ember-exam/config/environment"eaimeta@70e063a35619d71f

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class App extends Ember.Application {
    constructor() {
      super(...arguments);

      _defineProperty(this, "modulePrefix", (cov_uputmd56i().s[0]++, _environment.default.modulePrefix));

      _defineProperty(this, "podModulePrefix", (cov_uputmd56i().s[1]++, _environment.default.podModulePrefix));

      _defineProperty(this, "Resolver", (cov_uputmd56i().s[2]++, _emberResolver.default));
    }

  }

  _exports.default = App;
  cov_uputmd56i().s[3]++;
  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);
});
;define("my-app-ember-exam/component-managers/glimmer", ["exports", "@glimmer/component/-private/ember-component-manager"], function (_exports, _emberComponentManager) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _emberComponentManager.default;
    }
  });

  function cov_2jd8jwac87() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/component-managers/glimmer.js";
    var hash = "b6504de1e43856444b35ddca9b3779b7ce99d939";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/component-managers/glimmer.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "b6504de1e43856444b35ddca9b3779b7ce99d939"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_2jd8jwac87 = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_2jd8jwac87();
  0; //eaimeta@70e063a35619d71f0,"@glimmer/component/-private/ember-component-manager"eaimeta@70e063a35619d71f
});
;define("my-app-ember-exam/components/welcome-page", ["exports", "ember-welcome-page/components/welcome-page"], function (_exports, _welcomePage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });

  function cov_29o50ie7cr() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/components/welcome-page.js";
    var hash = "f97c6df8c297d65f9206165708cae7d2481d9977";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/components/welcome-page.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "f97c6df8c297d65f9206165708cae7d2481d9977"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_29o50ie7cr = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_29o50ie7cr();
  0; //eaimeta@70e063a35619d71f0,"ember-welcome-page/components/welcome-page"eaimeta@70e063a35619d71f
});
;define("my-app-ember-exam/data-adapter", ["exports", "@ember-data/debug"], function (_exports, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _debug.default;
    }
  });

  function cov_1ky2j9r6jl() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/data-adapter.js";
    var hash = "d3aa880292c01973d3652ee0c5b9ca999d6b8bc7";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/data-adapter.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "d3aa880292c01973d3652ee0c5b9ca999d6b8bc7"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_1ky2j9r6jl = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_1ky2j9r6jl();
  0; //eaimeta@70e063a35619d71f0,"@ember-data/debug"eaimeta@70e063a35619d71f
});
;define("my-app-ember-exam/helpers/app-version", ["exports", "my-app-ember-exam/config/environment", "ember-cli-app-version/utils/regexp"], function (_exports, _environment, _regexp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.appVersion = appVersion;
  _exports.default = void 0;

  function cov_26mchx2t0q() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/helpers/app-version.js";
    var hash = "a488fcb27cb22937c90babee16989133481cbb97";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/helpers/app-version.js",
      statementMap: {
        "0": {
          start: {
            line: 6,
            column: 18
          },
          end: {
            line: 6,
            column: 36
          }
        },
        "1": {
          start: {
            line: 10,
            column: 20
          },
          end: {
            line: 10,
            column: 52
          }
        },
        "2": {
          start: {
            line: 11,
            column: 16
          },
          end: {
            line: 11,
            column: 48
          }
        },
        "3": {
          start: {
            line: 13,
            column: 14
          },
          end: {
            line: 13,
            column: 18
          }
        },
        "4": {
          start: {
            line: 15,
            column: 2
          },
          end: {
            line: 23,
            column: 3
          }
        },
        "5": {
          start: {
            line: 16,
            column: 4
          },
          end: {
            line: 18,
            column: 5
          }
        },
        "6": {
          start: {
            line: 17,
            column: 6
          },
          end: {
            line: 17,
            column: 51
          }
        },
        "7": {
          start: {
            line: 20,
            column: 4
          },
          end: {
            line: 22,
            column: 5
          }
        },
        "8": {
          start: {
            line: 21,
            column: 6
          },
          end: {
            line: 21,
            column: 43
          }
        },
        "9": {
          start: {
            line: 25,
            column: 2
          },
          end: {
            line: 27,
            column: 3
          }
        },
        "10": {
          start: {
            line: 26,
            column: 4
          },
          end: {
            line: 26,
            column: 37
          }
        },
        "11": {
          start: {
            line: 29,
            column: 2
          },
          end: {
            line: 29,
            column: 36
          }
        }
      },
      fnMap: {
        "0": {
          name: "appVersion",
          decl: {
            start: {
              line: 5,
              column: 16
            },
            end: {
              line: 5,
              column: 26
            }
          },
          loc: {
            start: {
              line: 5,
              column: 41
            },
            end: {
              line: 30,
              column: 1
            }
          },
          line: 5
        }
      },
      branchMap: {
        "0": {
          loc: {
            start: {
              line: 5,
              column: 30
            },
            end: {
              line: 5,
              column: 39
            }
          },
          type: "default-arg",
          locations: [{
            start: {
              line: 5,
              column: 37
            },
            end: {
              line: 5,
              column: 39
            }
          }],
          line: 5
        },
        "1": {
          loc: {
            start: {
              line: 10,
              column: 20
            },
            end: {
              line: 10,
              column: 52
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 10,
              column: 20
            },
            end: {
              line: 10,
              column: 36
            }
          }, {
            start: {
              line: 10,
              column: 40
            },
            end: {
              line: 10,
              column: 52
            }
          }],
          line: 10
        },
        "2": {
          loc: {
            start: {
              line: 11,
              column: 16
            },
            end: {
              line: 11,
              column: 48
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 11,
              column: 16
            },
            end: {
              line: 11,
              column: 28
            }
          }, {
            start: {
              line: 11,
              column: 32
            },
            end: {
              line: 11,
              column: 48
            }
          }],
          line: 11
        },
        "3": {
          loc: {
            start: {
              line: 15,
              column: 2
            },
            end: {
              line: 23,
              column: 3
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 15,
              column: 2
            },
            end: {
              line: 23,
              column: 3
            }
          }, {
            start: {
              line: 15,
              column: 2
            },
            end: {
              line: 23,
              column: 3
            }
          }],
          line: 15
        },
        "4": {
          loc: {
            start: {
              line: 16,
              column: 4
            },
            end: {
              line: 18,
              column: 5
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 16,
              column: 4
            },
            end: {
              line: 18,
              column: 5
            }
          }, {
            start: {
              line: 16,
              column: 4
            },
            end: {
              line: 18,
              column: 5
            }
          }],
          line: 16
        },
        "5": {
          loc: {
            start: {
              line: 20,
              column: 4
            },
            end: {
              line: 22,
              column: 5
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 20,
              column: 4
            },
            end: {
              line: 22,
              column: 5
            }
          }, {
            start: {
              line: 20,
              column: 4
            },
            end: {
              line: 22,
              column: 5
            }
          }],
          line: 20
        },
        "6": {
          loc: {
            start: {
              line: 25,
              column: 2
            },
            end: {
              line: 27,
              column: 3
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 25,
              column: 2
            },
            end: {
              line: 27,
              column: 3
            }
          }, {
            start: {
              line: 25,
              column: 2
            },
            end: {
              line: 27,
              column: 3
            }
          }],
          line: 25
        },
        "7": {
          loc: {
            start: {
              line: 29,
              column: 9
            },
            end: {
              line: 29,
              column: 35
            }
          },
          type: "cond-expr",
          locations: [{
            start: {
              line: 29,
              column: 17
            },
            end: {
              line: 29,
              column: 25
            }
          }, {
            start: {
              line: 29,
              column: 28
            },
            end: {
              line: 29,
              column: 35
            }
          }],
          line: 29
        }
      },
      s: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0
      },
      f: {
        "0": 0
      },
      b: {
        "0": [0],
        "1": [0, 0],
        "2": [0, 0],
        "3": [0, 0],
        "4": [0, 0],
        "5": [0, 0],
        "6": [0, 0],
        "7": [0, 0]
      },
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "a488fcb27cb22937c90babee16989133481cbb97"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_26mchx2t0q = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_26mchx2t0q();
  0; //eaimeta@70e063a35619d71f0,"@ember/component/helper",0,"my-app-ember-exam/config/environment",0,"ember-cli-app-version/utils/regexp"eaimeta@70e063a35619d71f

  function appVersion(_) {
    let hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (cov_26mchx2t0q().b[0][0]++, {});
    cov_26mchx2t0q().f[0]++;
    const version = (cov_26mchx2t0q().s[0]++, _environment.default.APP.version); // e.g. 1.0.0-alpha.1+4jds75hf
    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility

    let versionOnly = (cov_26mchx2t0q().s[1]++, (cov_26mchx2t0q().b[1][0]++, hash.versionOnly) || (cov_26mchx2t0q().b[1][1]++, hash.hideSha));
    let shaOnly = (cov_26mchx2t0q().s[2]++, (cov_26mchx2t0q().b[2][0]++, hash.shaOnly) || (cov_26mchx2t0q().b[2][1]++, hash.hideVersion));
    let match = (cov_26mchx2t0q().s[3]++, null);
    cov_26mchx2t0q().s[4]++;

    if (versionOnly) {
      cov_26mchx2t0q().b[3][0]++;
      cov_26mchx2t0q().s[5]++;

      if (hash.showExtended) {
        cov_26mchx2t0q().b[4][0]++;
        cov_26mchx2t0q().s[6]++;
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      } else {
        cov_26mchx2t0q().b[4][1]++;
      } // Fallback to just version


      cov_26mchx2t0q().s[7]++;

      if (!match) {
        cov_26mchx2t0q().b[5][0]++;
        cov_26mchx2t0q().s[8]++;
        match = version.match(_regexp.versionRegExp); // 1.0.0
      } else {
        cov_26mchx2t0q().b[5][1]++;
      }
    } else {
      cov_26mchx2t0q().b[3][1]++;
    }

    cov_26mchx2t0q().s[9]++;

    if (shaOnly) {
      cov_26mchx2t0q().b[6][0]++;
      cov_26mchx2t0q().s[10]++;
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    } else {
      cov_26mchx2t0q().b[6][1]++;
    }

    cov_26mchx2t0q().s[11]++;
    return match ? (cov_26mchx2t0q().b[7][0]++, match[0]) : (cov_26mchx2t0q().b[7][1]++, version);
  }

  var _default = Ember.Helper.helper(appVersion);

  _exports.default = _default;
});
;define("my-app-ember-exam/helpers/pluralize", ["exports", "ember-inflector/lib/helpers/pluralize"], function (_exports, _pluralize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function cov_2a8grxws55() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/helpers/pluralize.js";
    var hash = "ed68c8876bca5b3a862c8c029bd5e0fa283652a5";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/helpers/pluralize.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "ed68c8876bca5b3a862c8c029bd5e0fa283652a5"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_2a8grxws55 = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_2a8grxws55();
  0; //eaimeta@70e063a35619d71f0,"ember-inflector/lib/helpers/pluralize"eaimeta@70e063a35619d71f

  var _default = _pluralize.default;
  _exports.default = _default;
});
;define("my-app-ember-exam/helpers/singularize", ["exports", "ember-inflector/lib/helpers/singularize"], function (_exports, _singularize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function cov_gi6jzrgvn() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/helpers/singularize.js";
    var hash = "8d3d25bd2007712426b3c56bc58f164ed271d674";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/helpers/singularize.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "8d3d25bd2007712426b3c56bc58f164ed271d674"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_gi6jzrgvn = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_gi6jzrgvn();
  0; //eaimeta@70e063a35619d71f0,"ember-inflector/lib/helpers/singularize"eaimeta@70e063a35619d71f

  var _default = _singularize.default;
  _exports.default = _default;
});
;define("my-app-ember-exam/initializers/app-version", ["exports", "ember-cli-app-version/initializer-factory", "my-app-ember-exam/config/environment"], function (_exports, _initializerFactory, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function cov_6gms4bba7() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/initializers/app-version.js";
    var hash = "f73a50ed3d14071586c599a5fa32204f90db2f45";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/initializers/app-version.js",
      statementMap: {
        "0": {
          start: {
            line: 5,
            column: 0
          },
          end: {
            line: 8,
            column: 1
          }
        },
        "1": {
          start: {
            line: 6,
            column: 2
          },
          end: {
            line: 6,
            column: 25
          }
        },
        "2": {
          start: {
            line: 7,
            column: 2
          },
          end: {
            line: 7,
            column: 31
          }
        }
      },
      fnMap: {},
      branchMap: {
        "0": {
          loc: {
            start: {
              line: 5,
              column: 0
            },
            end: {
              line: 8,
              column: 1
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 5,
              column: 0
            },
            end: {
              line: 8,
              column: 1
            }
          }, {
            start: {
              line: 5,
              column: 0
            },
            end: {
              line: 8,
              column: 1
            }
          }],
          line: 5
        }
      },
      s: {
        "0": 0,
        "1": 0,
        "2": 0
      },
      f: {},
      b: {
        "0": [0, 0]
      },
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "f73a50ed3d14071586c599a5fa32204f90db2f45"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_6gms4bba7 = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_6gms4bba7();
  0; //eaimeta@70e063a35619d71f0,"ember-cli-app-version/initializer-factory",0,"my-app-ember-exam/config/environment"eaimeta@70e063a35619d71f

  let name, version;
  cov_6gms4bba7().s[0]++;

  if (_environment.default.APP) {
    cov_6gms4bba7().b[0][0]++;
    cov_6gms4bba7().s[1]++;
    name = _environment.default.APP.name;
    cov_6gms4bba7().s[2]++;
    version = _environment.default.APP.version;
  } else {
    cov_6gms4bba7().b[0][1]++;
  }

  var _default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
  _exports.default = _default;
});
;define("my-app-ember-exam/initializers/container-debug-adapter", ["exports", "ember-resolver/resolvers/classic/container-debug-adapter"], function (_exports, _containerDebugAdapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function cov_2esf39ioqg() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/initializers/container-debug-adapter.js";
    var hash = "39f9e14b5b32f393150943ca4fd4d61851799319";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/initializers/container-debug-adapter.js",
      statementMap: {
        "0": {
          start: {
            line: 7,
            column: 14
          },
          end: {
            line: 7,
            column: 42
          }
        },
        "1": {
          start: {
            line: 9,
            column: 4
          },
          end: {
            line: 9,
            column: 72
          }
        },
        "2": {
          start: {
            line: 10,
            column: 4
          },
          end: {
            line: 10,
            column: 80
          }
        }
      },
      fnMap: {
        "0": {
          name: "(anonymous_0)",
          decl: {
            start: {
              line: 6,
              column: 2
            },
            end: {
              line: 6,
              column: 3
            }
          },
          loc: {
            start: {
              line: 6,
              column: 15
            },
            end: {
              line: 11,
              column: 3
            }
          },
          line: 6
        }
      },
      branchMap: {
        "0": {
          loc: {
            start: {
              line: 7,
              column: 14
            },
            end: {
              line: 7,
              column: 42
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 7,
              column: 14
            },
            end: {
              line: 7,
              column: 26
            }
          }, {
            start: {
              line: 7,
              column: 30
            },
            end: {
              line: 7,
              column: 42
            }
          }],
          line: 7
        }
      },
      s: {
        "0": 0,
        "1": 0,
        "2": 0
      },
      f: {
        "0": 0
      },
      b: {
        "0": [0, 0]
      },
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "39f9e14b5b32f393150943ca4fd4d61851799319"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_2esf39ioqg = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_2esf39ioqg();
  0; //eaimeta@70e063a35619d71f0,"ember-resolver/resolvers/classic/container-debug-adapter"eaimeta@70e063a35619d71f

  var _default = {
    name: 'container-debug-adapter',

    initialize() {
      cov_2esf39ioqg().f[0]++;
      let app = (cov_2esf39ioqg().s[0]++, (cov_2esf39ioqg().b[0][0]++, arguments[1]) || (cov_2esf39ioqg().b[0][1]++, arguments[0]));
      cov_2esf39ioqg().s[1]++;
      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      cov_2esf39ioqg().s[2]++;
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }

  };
  _exports.default = _default;
});
;define("my-app-ember-exam/initializers/ember-data-data-adapter", ["exports", "@ember-data/debug/setup"], function (_exports, _setup) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _setup.default;
    }
  });

  function cov_22q58z9c3f() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/initializers/ember-data-data-adapter.js";
    var hash = "f1c6678891dcf25aa177ec56b1764c7fe3d85fc8";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/initializers/ember-data-data-adapter.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "f1c6678891dcf25aa177ec56b1764c7fe3d85fc8"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_22q58z9c3f = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_22q58z9c3f();
  0; //eaimeta@70e063a35619d71f0,"@ember-data/debug/setup"eaimeta@70e063a35619d71f
});
;define("my-app-ember-exam/initializers/ember-data", ["exports", "ember-data", "ember-data/setup-container"], function (_exports, _emberData, _setupContainer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function cov_8jptz9zzl() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/initializers/ember-data.js";
    var hash = "d2a447f583d8478bbfa5015a2eafe5bd840da8a6";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/initializers/ember-data.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "d2a447f583d8478bbfa5015a2eafe5bd840da8a6"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_8jptz9zzl = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_8jptz9zzl();
  0; //eaimeta@70e063a35619d71f0,"ember-data",0,"ember-data/setup-container"eaimeta@70e063a35619d71f

  /*
    This code initializes EmberData in an Ember application.
  
    It ensures that the `store` service is automatically injected
    as the `store` property on all routes and controllers.
  */
  var _default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
  _exports.default = _default;
});
;define("my-app-ember-exam/initializers/export-application-global", ["exports", "my-app-ember-exam/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _exports.initialize = initialize;

  function cov_1k9adz1pv4() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/initializers/export-application-global.js";
    var hash = "e9afa0a3895a0abe91ee4f342e9580fa15b3d0bb";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/initializers/export-application-global.js",
      statementMap: {
        "0": {
          start: {
            line: 5,
            column: 20
          },
          end: {
            line: 5,
            column: 48
          }
        },
        "1": {
          start: {
            line: 6,
            column: 2
          },
          end: {
            line: 38,
            column: 3
          }
        },
        "2": {
          start: {
            line: 8,
            column: 4
          },
          end: {
            line: 17,
            column: 5
          }
        },
        "3": {
          start: {
            line: 9,
            column: 8
          },
          end: {
            line: 9,
            column: 27
          }
        },
        "4": {
          start: {
            line: 10,
            column: 11
          },
          end: {
            line: 17,
            column: 5
          }
        },
        "5": {
          start: {
            line: 11,
            column: 8
          },
          end: {
            line: 11,
            column: 26
          }
        },
        "6": {
          start: {
            line: 12,
            column: 11
          },
          end: {
            line: 17,
            column: 5
          }
        },
        "7": {
          start: {
            line: 13,
            column: 8
          },
          end: {
            line: 13,
            column: 25
          }
        },
        "8": {
          start: {
            line: 16,
            column: 7
          },
          end: {
            line: 16,
            column: 14
          }
        },
        "9": {
          start: {
            line: 19,
            column: 16
          },
          end: {
            line: 19,
            column: 46
          }
        },
        "10": {
          start: {
            line: 22,
            column: 4
          },
          end: {
            line: 26,
            column: 5
          }
        },
        "11": {
          start: {
            line: 23,
            column: 6
          },
          end: {
            line: 23,
            column: 25
          }
        },
        "12": {
          start: {
            line: 25,
            column: 6
          },
          end: {
            line: 25,
            column: 62
          }
        },
        "13": {
          start: {
            line: 28,
            column: 4
          },
          end: {
            line: 37,
            column: 5
          }
        },
        "14": {
          start: {
            line: 29,
            column: 6
          },
          end: {
            line: 29,
            column: 42
          }
        },
        "15": {
          start: {
            line: 31,
            column: 6
          },
          end: {
            line: 36,
            column: 9
          }
        },
        "16": {
          start: {
            line: 33,
            column: 10
          },
          end: {
            line: 33,
            column: 45
          }
        },
        "17": {
          start: {
            line: 34,
            column: 10
          },
          end: {
            line: 34,
            column: 39
          }
        }
      },
      fnMap: {
        "0": {
          name: "initialize",
          decl: {
            start: {
              line: 4,
              column: 16
            },
            end: {
              line: 4,
              column: 26
            }
          },
          loc: {
            start: {
              line: 4,
              column: 29
            },
            end: {
              line: 39,
              column: 1
            }
          },
          line: 4
        },
        "1": {
          name: "(anonymous_1)",
          decl: {
            start: {
              line: 32,
              column: 21
            },
            end: {
              line: 32,
              column: 22
            }
          },
          loc: {
            start: {
              line: 32,
              column: 32
            },
            end: {
              line: 35,
              column: 9
            }
          },
          line: 32
        }
      },
      branchMap: {
        "0": {
          loc: {
            start: {
              line: 5,
              column: 20
            },
            end: {
              line: 5,
              column: 48
            }
          },
          type: "binary-expr",
          locations: [{
            start: {
              line: 5,
              column: 20
            },
            end: {
              line: 5,
              column: 32
            }
          }, {
            start: {
              line: 5,
              column: 36
            },
            end: {
              line: 5,
              column: 48
            }
          }],
          line: 5
        },
        "1": {
          loc: {
            start: {
              line: 6,
              column: 2
            },
            end: {
              line: 38,
              column: 3
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 6,
              column: 2
            },
            end: {
              line: 38,
              column: 3
            }
          }, {
            start: {
              line: 6,
              column: 2
            },
            end: {
              line: 38,
              column: 3
            }
          }],
          line: 6
        },
        "2": {
          loc: {
            start: {
              line: 8,
              column: 4
            },
            end: {
              line: 17,
              column: 5
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 8,
              column: 4
            },
            end: {
              line: 17,
              column: 5
            }
          }, {
            start: {
              line: 8,
              column: 4
            },
            end: {
              line: 17,
              column: 5
            }
          }],
          line: 8
        },
        "3": {
          loc: {
            start: {
              line: 10,
              column: 11
            },
            end: {
              line: 17,
              column: 5
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 10,
              column: 11
            },
            end: {
              line: 17,
              column: 5
            }
          }, {
            start: {
              line: 10,
              column: 11
            },
            end: {
              line: 17,
              column: 5
            }
          }],
          line: 10
        },
        "4": {
          loc: {
            start: {
              line: 12,
              column: 11
            },
            end: {
              line: 17,
              column: 5
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 12,
              column: 11
            },
            end: {
              line: 17,
              column: 5
            }
          }, {
            start: {
              line: 12,
              column: 11
            },
            end: {
              line: 17,
              column: 5
            }
          }],
          line: 12
        },
        "5": {
          loc: {
            start: {
              line: 22,
              column: 4
            },
            end: {
              line: 26,
              column: 5
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 22,
              column: 4
            },
            end: {
              line: 26,
              column: 5
            }
          }, {
            start: {
              line: 22,
              column: 4
            },
            end: {
              line: 26,
              column: 5
            }
          }],
          line: 22
        },
        "6": {
          loc: {
            start: {
              line: 28,
              column: 4
            },
            end: {
              line: 37,
              column: 5
            }
          },
          type: "if",
          locations: [{
            start: {
              line: 28,
              column: 4
            },
            end: {
              line: 37,
              column: 5
            }
          }, {
            start: {
              line: 28,
              column: 4
            },
            end: {
              line: 37,
              column: 5
            }
          }],
          line: 28
        }
      },
      s: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "6": 0,
        "7": 0,
        "8": 0,
        "9": 0,
        "10": 0,
        "11": 0,
        "12": 0,
        "13": 0,
        "14": 0,
        "15": 0,
        "16": 0,
        "17": 0
      },
      f: {
        "0": 0,
        "1": 0
      },
      b: {
        "0": [0, 0],
        "1": [0, 0],
        "2": [0, 0],
        "3": [0, 0],
        "4": [0, 0],
        "5": [0, 0],
        "6": [0, 0]
      },
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "e9afa0a3895a0abe91ee4f342e9580fa15b3d0bb"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_1k9adz1pv4 = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_1k9adz1pv4();
  0; //eaimeta@70e063a35619d71f0,"ember",0,"my-app-ember-exam/config/environment"eaimeta@70e063a35619d71f

  function initialize() {
    cov_1k9adz1pv4().f[0]++;
    var application = (cov_1k9adz1pv4().s[0]++, (cov_1k9adz1pv4().b[0][0]++, arguments[1]) || (cov_1k9adz1pv4().b[0][1]++, arguments[0]));
    cov_1k9adz1pv4().s[1]++;

    if (_environment.default.exportApplicationGlobal !== false) {
      cov_1k9adz1pv4().b[1][0]++;
      var theGlobal;
      cov_1k9adz1pv4().s[2]++;

      if (typeof window !== 'undefined') {
        cov_1k9adz1pv4().b[2][0]++;
        cov_1k9adz1pv4().s[3]++;
        theGlobal = window;
      } else {
        cov_1k9adz1pv4().b[2][1]++;
        cov_1k9adz1pv4().s[4]++;

        if (typeof global !== 'undefined') {
          cov_1k9adz1pv4().b[3][0]++;
          cov_1k9adz1pv4().s[5]++;
          theGlobal = global;
        } else {
          cov_1k9adz1pv4().b[3][1]++;
          cov_1k9adz1pv4().s[6]++;

          if (typeof self !== 'undefined') {
            cov_1k9adz1pv4().b[4][0]++;
            cov_1k9adz1pv4().s[7]++;
            theGlobal = self;
          } else {
            cov_1k9adz1pv4().b[4][1]++;
            cov_1k9adz1pv4().s[8]++;
            // no reasonable global, just bail
            return;
          }
        }
      }

      var value = (cov_1k9adz1pv4().s[9]++, _environment.default.exportApplicationGlobal);
      var globalName;
      cov_1k9adz1pv4().s[10]++;

      if (typeof value === 'string') {
        cov_1k9adz1pv4().b[5][0]++;
        cov_1k9adz1pv4().s[11]++;
        globalName = value;
      } else {
        cov_1k9adz1pv4().b[5][1]++;
        cov_1k9adz1pv4().s[12]++;
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      cov_1k9adz1pv4().s[13]++;

      if (!theGlobal[globalName]) {
        cov_1k9adz1pv4().b[6][0]++;
        cov_1k9adz1pv4().s[14]++;
        theGlobal[globalName] = application;
        cov_1k9adz1pv4().s[15]++;
        application.reopen({
          willDestroy: function () {
            cov_1k9adz1pv4().f[1]++;
            cov_1k9adz1pv4().s[16]++;

            this._super.apply(this, arguments);

            cov_1k9adz1pv4().s[17]++;
            delete theGlobal[globalName];
          }
        });
      } else {
        cov_1k9adz1pv4().b[6][1]++;
      }
    } else {
      cov_1k9adz1pv4().b[1][1]++;
    }
  }

  var _default = {
    name: 'export-application-global',
    initialize: initialize
  };
  _exports.default = _default;
});
;define("my-app-ember-exam/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (_exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function cov_9mfbb652v() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/instance-initializers/ember-data.js";
    var hash = "0174b6867b04c90c30803847d85f3524f2a033d3";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/instance-initializers/ember-data.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "0174b6867b04c90c30803847d85f3524f2a033d3"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_9mfbb652v = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_9mfbb652v();
  0; //eaimeta@70e063a35619d71f0,"ember-data/initialize-store-service"eaimeta@70e063a35619d71f

  var _default = {
    name: 'ember-data',
    initialize: _initializeStoreService.default
  };
  _exports.default = _default;
});
;define("my-app-ember-exam/router", ["exports", "my-app-ember-exam/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function cov_2llzky0cx7() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/router.js";
    var hash = "74272aba6088b8ee4342414fd5fcb1a7285ceac3";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/router.js",
      statementMap: {
        "0": {
          start: {
            line: 5,
            column: 13
          },
          end: {
            line: 5,
            column: 32
          }
        },
        "1": {
          start: {
            line: 6,
            column: 12
          },
          end: {
            line: 6,
            column: 26
          }
        },
        "2": {
          start: {
            line: 9,
            column: 0
          },
          end: {
            line: 10,
            column: 3
          }
        }
      },
      fnMap: {
        "0": {
          name: "(anonymous_0)",
          decl: {
            start: {
              line: 9,
              column: 11
            },
            end: {
              line: 9,
              column: 12
            }
          },
          loc: {
            start: {
              line: 9,
              column: 22
            },
            end: {
              line: 10,
              column: 1
            }
          },
          line: 9
        }
      },
      branchMap: {},
      s: {
        "0": 0,
        "1": 0,
        "2": 0
      },
      f: {
        "0": 0
      },
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "74272aba6088b8ee4342414fd5fcb1a7285ceac3"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_2llzky0cx7 = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_2llzky0cx7();
  0; //eaimeta@70e063a35619d71f0,"@ember/routing/router",0,"my-app-ember-exam/config/environment"eaimeta@70e063a35619d71f

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class Router extends Ember.Router {
    constructor() {
      super(...arguments);

      _defineProperty(this, "location", (cov_2llzky0cx7().s[0]++, _environment.default.locationType));

      _defineProperty(this, "rootURL", (cov_2llzky0cx7().s[1]++, _environment.default.rootURL));
    }

  }

  _exports.default = Router;
  cov_2llzky0cx7().s[2]++;
  Router.map(function () {
    cov_2llzky0cx7().f[0]++;
  });
});
;define("my-app-ember-exam/serializers/-default", ["exports", "@ember-data/serializer/json"], function (_exports, _json) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _json.default;
    }
  });

  function cov_h9wl0te8b() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/serializers/-default.js";
    var hash = "bd2774eaed3093a8186f11de132c8b4c41677e5d";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/serializers/-default.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "bd2774eaed3093a8186f11de132c8b4c41677e5d"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_h9wl0te8b = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_h9wl0te8b();
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/json"eaimeta@70e063a35619d71f
});
;define("my-app-ember-exam/serializers/-json-api", ["exports", "@ember-data/serializer/json-api"], function (_exports, _jsonApi) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _jsonApi.default;
    }
  });

  function cov_1g0w51nbqn() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/serializers/-json-api.js";
    var hash = "66a87759c4d9672c2b412c0303496aea6834fe7f";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/serializers/-json-api.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "66a87759c4d9672c2b412c0303496aea6834fe7f"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_1g0w51nbqn = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_1g0w51nbqn();
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/json-api"eaimeta@70e063a35619d71f
});
;define("my-app-ember-exam/serializers/-rest", ["exports", "@ember-data/serializer/rest"], function (_exports, _rest) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _rest.default;
    }
  });

  function cov_1t9yl72d94() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/serializers/-rest.js";
    var hash = "4b7c928f154664311bb73197005f3734d831c57c";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/serializers/-rest.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "4b7c928f154664311bb73197005f3734d831c57c"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_1t9yl72d94 = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_1t9yl72d94();
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/rest"eaimeta@70e063a35619d71f
});
;define("my-app-ember-exam/services/store", ["exports", "ember-data/store"], function (_exports, _store) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _store.default;
    }
  });

  function cov_2ajphcf3cr() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/services/store.js";
    var hash = "6b6112fdd9ca3f0847f1fd9b1da53a9ccd858e1b";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/services/store.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "6b6112fdd9ca3f0847f1fd9b1da53a9ccd858e1b"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_2ajphcf3cr = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_2ajphcf3cr();
  0; //eaimeta@70e063a35619d71f0,"ember-data/store"eaimeta@70e063a35619d71f
});
;define("my-app-ember-exam/templates/application", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function cov_1epc5hoqix() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/templates/application.js";
    var hash = "e9a4f1c966a944fd42dc0c9cd62bab69f3442ab4";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/templates/application.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "e9a4f1c966a944fd42dc0c9cd62bab69f3442ab4"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_1epc5hoqix = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_1epc5hoqix();
  0; //eaimeta@70e063a35619d71feaimeta@70e063a35619d71f

  var _default = Ember.HTMLBars.template({
    "id": "78sl0Rrj",
    "block": "{\"symbols\":[],\"statements\":[[5,\"welcome-page\",[],[[],[]]],[0,\"\\n\"],[0,\"\\n\"],[1,[22,\"outlet\"],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "my-app-ember-exam/templates/application.hbs"
    }
  });

  _exports.default = _default;
});
;define("my-app-ember-exam/transforms/boolean", ["exports", "@ember-data/serializer/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _private.BooleanTransform;
    }
  });

  function cov_2fu48cymd9() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/transforms/boolean.js";
    var hash = "56d9523bc18e0a4746baea3486962d1675f38532";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/transforms/boolean.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "56d9523bc18e0a4746baea3486962d1675f38532"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_2fu48cymd9 = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_2fu48cymd9();
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/-private"eaimeta@70e063a35619d71f
});
;define("my-app-ember-exam/transforms/date", ["exports", "@ember-data/serializer/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _private.DateTransform;
    }
  });

  function cov_1yprmqizlj() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/transforms/date.js";
    var hash = "71c2316c7f0146410b025759b264e7f6d3ffbd21";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/transforms/date.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "71c2316c7f0146410b025759b264e7f6d3ffbd21"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_1yprmqizlj = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_1yprmqizlj();
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/-private"eaimeta@70e063a35619d71f
});
;define("my-app-ember-exam/transforms/number", ["exports", "@ember-data/serializer/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _private.NumberTransform;
    }
  });

  function cov_2430ok27r8() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/transforms/number.js";
    var hash = "4d7882ce79c1435900d3916aca6e07abd2310c3a";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/transforms/number.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "4d7882ce79c1435900d3916aca6e07abd2310c3a"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_2430ok27r8 = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_2430ok27r8();
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/-private"eaimeta@70e063a35619d71f
});
;define("my-app-ember-exam/transforms/string", ["exports", "@ember-data/serializer/-private"], function (_exports, _private) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _private.StringTransform;
    }
  });

  function cov_2amcisg5dk() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/transforms/string.js";
    var hash = "62836f36a2473062ae53bc12c8a114cf46394016";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/transforms/string.js",
      statementMap: {},
      fnMap: {},
      branchMap: {},
      s: {},
      f: {},
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "62836f36a2473062ae53bc12c8a114cf46394016"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_2amcisg5dk = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_2amcisg5dk();
  0; //eaimeta@70e063a35619d71f0,"@ember-data/serializer/-private"eaimeta@70e063a35619d71f
});
;define("my-app-ember-exam/utils/my-covered-util", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = myCoveredUtil;

  function cov_27og3sms27() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/utils/my-covered-util.js";
    var hash = "aa17cbeea9c697ea1fe73ec81e04fc8cb844ca24";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/utils/my-covered-util.js",
      statementMap: {
        "0": {
          start: {
            line: 2,
            column: 2
          },
          end: {
            line: 2,
            column: 14
          }
        }
      },
      fnMap: {
        "0": {
          name: "myCoveredUtil",
          decl: {
            start: {
              line: 1,
              column: 24
            },
            end: {
              line: 1,
              column: 37
            }
          },
          loc: {
            start: {
              line: 1,
              column: 40
            },
            end: {
              line: 3,
              column: 1
            }
          },
          line: 1
        }
      },
      branchMap: {},
      s: {
        "0": 0
      },
      f: {
        "0": 0
      },
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "aa17cbeea9c697ea1fe73ec81e04fc8cb844ca24"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_27og3sms27 = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_27og3sms27();
  0; //eaimeta@70e063a35619d71feaimeta@70e063a35619d71f

  function myCoveredUtil() {
    cov_27og3sms27().f[0]++;
    cov_27og3sms27().s[0]++;
    return true;
  }
});
;define("my-app-ember-exam/utils/my-uncovered-util-three", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = myUncoveredUtil31;
  _exports.myUncoveredUtil32 = myUncoveredUtil32;
  _exports.myUncoveredUtil33 = myUncoveredUtil33;
  _exports.myUncoveredUtil34 = myUncoveredUtil34;
  _exports.myUncoveredUtil35 = myUncoveredUtil35;
  _exports.myUncoveredUtil36 = myUncoveredUtil36;

  function cov_1uz8kiz25y() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/utils/my-uncovered-util-three.js";
    var hash = "4d323af564d1cf18c19f35f43724aac4cd98ac56";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/utils/my-uncovered-util-three.js",
      statementMap: {
        "0": {
          start: {
            line: 2,
            column: 2
          },
          end: {
            line: 2,
            column: 14
          }
        },
        "1": {
          start: {
            line: 6,
            column: 2
          },
          end: {
            line: 6,
            column: 14
          }
        },
        "2": {
          start: {
            line: 10,
            column: 2
          },
          end: {
            line: 10,
            column: 14
          }
        },
        "3": {
          start: {
            line: 14,
            column: 2
          },
          end: {
            line: 14,
            column: 14
          }
        },
        "4": {
          start: {
            line: 18,
            column: 2
          },
          end: {
            line: 18,
            column: 14
          }
        },
        "5": {
          start: {
            line: 22,
            column: 2
          },
          end: {
            line: 22,
            column: 14
          }
        }
      },
      fnMap: {
        "0": {
          name: "myUncoveredUtil31",
          decl: {
            start: {
              line: 1,
              column: 24
            },
            end: {
              line: 1,
              column: 41
            }
          },
          loc: {
            start: {
              line: 1,
              column: 44
            },
            end: {
              line: 3,
              column: 1
            }
          },
          line: 1
        },
        "1": {
          name: "myUncoveredUtil32",
          decl: {
            start: {
              line: 5,
              column: 16
            },
            end: {
              line: 5,
              column: 33
            }
          },
          loc: {
            start: {
              line: 5,
              column: 36
            },
            end: {
              line: 7,
              column: 1
            }
          },
          line: 5
        },
        "2": {
          name: "myUncoveredUtil33",
          decl: {
            start: {
              line: 9,
              column: 16
            },
            end: {
              line: 9,
              column: 33
            }
          },
          loc: {
            start: {
              line: 9,
              column: 36
            },
            end: {
              line: 11,
              column: 1
            }
          },
          line: 9
        },
        "3": {
          name: "myUncoveredUtil34",
          decl: {
            start: {
              line: 13,
              column: 16
            },
            end: {
              line: 13,
              column: 33
            }
          },
          loc: {
            start: {
              line: 13,
              column: 36
            },
            end: {
              line: 15,
              column: 1
            }
          },
          line: 13
        },
        "4": {
          name: "myUncoveredUtil35",
          decl: {
            start: {
              line: 17,
              column: 16
            },
            end: {
              line: 17,
              column: 33
            }
          },
          loc: {
            start: {
              line: 17,
              column: 36
            },
            end: {
              line: 19,
              column: 1
            }
          },
          line: 17
        },
        "5": {
          name: "myUncoveredUtil36",
          decl: {
            start: {
              line: 21,
              column: 16
            },
            end: {
              line: 21,
              column: 33
            }
          },
          loc: {
            start: {
              line: 21,
              column: 36
            },
            end: {
              line: 23,
              column: 1
            }
          },
          line: 21
        }
      },
      branchMap: {},
      s: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
      },
      f: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
      },
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "4d323af564d1cf18c19f35f43724aac4cd98ac56"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_1uz8kiz25y = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_1uz8kiz25y();
  0; //eaimeta@70e063a35619d71feaimeta@70e063a35619d71f

  function myUncoveredUtil31() {
    cov_1uz8kiz25y().f[0]++;
    cov_1uz8kiz25y().s[0]++;
    return true;
  }

  function myUncoveredUtil32() {
    cov_1uz8kiz25y().f[1]++;
    cov_1uz8kiz25y().s[1]++;
    return true;
  }

  function myUncoveredUtil33() {
    cov_1uz8kiz25y().f[2]++;
    cov_1uz8kiz25y().s[2]++;
    return true;
  }

  function myUncoveredUtil34() {
    cov_1uz8kiz25y().f[3]++;
    cov_1uz8kiz25y().s[3]++;
    return true;
  }

  function myUncoveredUtil35() {
    cov_1uz8kiz25y().f[4]++;
    cov_1uz8kiz25y().s[4]++;
    return true;
  }

  function myUncoveredUtil36() {
    cov_1uz8kiz25y().f[5]++;
    cov_1uz8kiz25y().s[5]++;
    return true;
  }
});
;define("my-app-ember-exam/utils/my-uncovered-util-two", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = myUncoveredUtil21;
  _exports.myUncoveredUtil22 = myUncoveredUtil22;
  _exports.myUncoveredUtil23 = myUncoveredUtil23;
  _exports.myUncoveredUtil24 = myUncoveredUtil24;
  _exports.myUncoveredUtil25 = myUncoveredUtil25;
  _exports.myUncoveredUtil26 = myUncoveredUtil26;

  function cov_2b97y891w9() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/utils/my-uncovered-util-two.js";
    var hash = "5db8b53c9a3ac08100b5cdd4dd992a942d599e85";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/utils/my-uncovered-util-two.js",
      statementMap: {
        "0": {
          start: {
            line: 2,
            column: 2
          },
          end: {
            line: 2,
            column: 14
          }
        },
        "1": {
          start: {
            line: 6,
            column: 2
          },
          end: {
            line: 6,
            column: 14
          }
        },
        "2": {
          start: {
            line: 10,
            column: 2
          },
          end: {
            line: 10,
            column: 14
          }
        },
        "3": {
          start: {
            line: 14,
            column: 2
          },
          end: {
            line: 14,
            column: 14
          }
        },
        "4": {
          start: {
            line: 18,
            column: 2
          },
          end: {
            line: 18,
            column: 14
          }
        },
        "5": {
          start: {
            line: 22,
            column: 2
          },
          end: {
            line: 22,
            column: 14
          }
        }
      },
      fnMap: {
        "0": {
          name: "myUncoveredUtil21",
          decl: {
            start: {
              line: 1,
              column: 24
            },
            end: {
              line: 1,
              column: 41
            }
          },
          loc: {
            start: {
              line: 1,
              column: 44
            },
            end: {
              line: 3,
              column: 1
            }
          },
          line: 1
        },
        "1": {
          name: "myUncoveredUtil22",
          decl: {
            start: {
              line: 5,
              column: 16
            },
            end: {
              line: 5,
              column: 33
            }
          },
          loc: {
            start: {
              line: 5,
              column: 36
            },
            end: {
              line: 7,
              column: 1
            }
          },
          line: 5
        },
        "2": {
          name: "myUncoveredUtil23",
          decl: {
            start: {
              line: 9,
              column: 16
            },
            end: {
              line: 9,
              column: 33
            }
          },
          loc: {
            start: {
              line: 9,
              column: 36
            },
            end: {
              line: 11,
              column: 1
            }
          },
          line: 9
        },
        "3": {
          name: "myUncoveredUtil24",
          decl: {
            start: {
              line: 13,
              column: 16
            },
            end: {
              line: 13,
              column: 33
            }
          },
          loc: {
            start: {
              line: 13,
              column: 36
            },
            end: {
              line: 15,
              column: 1
            }
          },
          line: 13
        },
        "4": {
          name: "myUncoveredUtil25",
          decl: {
            start: {
              line: 17,
              column: 16
            },
            end: {
              line: 17,
              column: 33
            }
          },
          loc: {
            start: {
              line: 17,
              column: 36
            },
            end: {
              line: 19,
              column: 1
            }
          },
          line: 17
        },
        "5": {
          name: "myUncoveredUtil26",
          decl: {
            start: {
              line: 21,
              column: 16
            },
            end: {
              line: 21,
              column: 33
            }
          },
          loc: {
            start: {
              line: 21,
              column: 36
            },
            end: {
              line: 23,
              column: 1
            }
          },
          line: 21
        }
      },
      branchMap: {},
      s: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
      },
      f: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
      },
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "5db8b53c9a3ac08100b5cdd4dd992a942d599e85"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_2b97y891w9 = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_2b97y891w9();
  0; //eaimeta@70e063a35619d71feaimeta@70e063a35619d71f

  function myUncoveredUtil21() {
    cov_2b97y891w9().f[0]++;
    cov_2b97y891w9().s[0]++;
    return true;
  }

  function myUncoveredUtil22() {
    cov_2b97y891w9().f[1]++;
    cov_2b97y891w9().s[1]++;
    return true;
  }

  function myUncoveredUtil23() {
    cov_2b97y891w9().f[2]++;
    cov_2b97y891w9().s[2]++;
    return true;
  }

  function myUncoveredUtil24() {
    cov_2b97y891w9().f[3]++;
    cov_2b97y891w9().s[3]++;
    return true;
  }

  function myUncoveredUtil25() {
    cov_2b97y891w9().f[4]++;
    cov_2b97y891w9().s[4]++;
    return true;
  }

  function myUncoveredUtil26() {
    cov_2b97y891w9().f[5]++;
    cov_2b97y891w9().s[5]++;
    return true;
  }
});
;define("my-app-ember-exam/utils/my-uncovered-util", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = myUncoveredUtil;
  _exports.myUncoveredUtil2 = myUncoveredUtil2;
  _exports.myUncoveredUtil3 = myUncoveredUtil3;
  _exports.myUncoveredUtil4 = myUncoveredUtil4;
  _exports.myUncoveredUtil5 = myUncoveredUtil5;
  _exports.myUncoveredUtil6 = myUncoveredUtil6;

  function cov_1xl3psv51b() {
    var path = "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/utils/my-uncovered-util.js";
    var hash = "d60e19840eae05b6a16670c014c6b9f269834fd9";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
      path: "/Users/dlaird/projects/ember-cli-code-coverage/test-packages/my-app-ember-exam/my-app-ember-exam/utils/my-uncovered-util.js",
      statementMap: {
        "0": {
          start: {
            line: 2,
            column: 2
          },
          end: {
            line: 2,
            column: 14
          }
        },
        "1": {
          start: {
            line: 6,
            column: 2
          },
          end: {
            line: 6,
            column: 14
          }
        },
        "2": {
          start: {
            line: 10,
            column: 2
          },
          end: {
            line: 10,
            column: 14
          }
        },
        "3": {
          start: {
            line: 14,
            column: 2
          },
          end: {
            line: 14,
            column: 14
          }
        },
        "4": {
          start: {
            line: 18,
            column: 2
          },
          end: {
            line: 18,
            column: 14
          }
        },
        "5": {
          start: {
            line: 22,
            column: 2
          },
          end: {
            line: 22,
            column: 14
          }
        }
      },
      fnMap: {
        "0": {
          name: "myUncoveredUtil",
          decl: {
            start: {
              line: 1,
              column: 24
            },
            end: {
              line: 1,
              column: 39
            }
          },
          loc: {
            start: {
              line: 1,
              column: 42
            },
            end: {
              line: 3,
              column: 1
            }
          },
          line: 1
        },
        "1": {
          name: "myUncoveredUtil2",
          decl: {
            start: {
              line: 5,
              column: 16
            },
            end: {
              line: 5,
              column: 32
            }
          },
          loc: {
            start: {
              line: 5,
              column: 35
            },
            end: {
              line: 7,
              column: 1
            }
          },
          line: 5
        },
        "2": {
          name: "myUncoveredUtil3",
          decl: {
            start: {
              line: 9,
              column: 16
            },
            end: {
              line: 9,
              column: 32
            }
          },
          loc: {
            start: {
              line: 9,
              column: 35
            },
            end: {
              line: 11,
              column: 1
            }
          },
          line: 9
        },
        "3": {
          name: "myUncoveredUtil4",
          decl: {
            start: {
              line: 13,
              column: 16
            },
            end: {
              line: 13,
              column: 32
            }
          },
          loc: {
            start: {
              line: 13,
              column: 35
            },
            end: {
              line: 15,
              column: 1
            }
          },
          line: 13
        },
        "4": {
          name: "myUncoveredUtil5",
          decl: {
            start: {
              line: 17,
              column: 16
            },
            end: {
              line: 17,
              column: 32
            }
          },
          loc: {
            start: {
              line: 17,
              column: 35
            },
            end: {
              line: 19,
              column: 1
            }
          },
          line: 17
        },
        "5": {
          name: "myUncoveredUtil6",
          decl: {
            start: {
              line: 21,
              column: 16
            },
            end: {
              line: 21,
              column: 32
            }
          },
          loc: {
            start: {
              line: 21,
              column: 35
            },
            end: {
              line: 23,
              column: 1
            }
          },
          line: 21
        }
      },
      branchMap: {},
      s: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
      },
      f: {
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0
      },
      b: {},
      _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
      hash: "d60e19840eae05b6a16670c014c6b9f269834fd9"
    };
    var coverage = global[gcv] || (global[gcv] = {});

    if (!coverage[path] || coverage[path].hash !== hash) {
      coverage[path] = coverageData;
    }

    var actualCoverage = coverage[path];
    {
      // @ts-ignore
      cov_1xl3psv51b = function () {
        return actualCoverage;
      };
    }
    return actualCoverage;
  }

  cov_1xl3psv51b();
  0; //eaimeta@70e063a35619d71feaimeta@70e063a35619d71f

  function myUncoveredUtil() {
    cov_1xl3psv51b().f[0]++;
    cov_1xl3psv51b().s[0]++;
    return true;
  }

  function myUncoveredUtil2() {
    cov_1xl3psv51b().f[1]++;
    cov_1xl3psv51b().s[1]++;
    return true;
  }

  function myUncoveredUtil3() {
    cov_1xl3psv51b().f[2]++;
    cov_1xl3psv51b().s[2]++;
    return true;
  }

  function myUncoveredUtil4() {
    cov_1xl3psv51b().f[3]++;
    cov_1xl3psv51b().s[3]++;
    return true;
  }

  function myUncoveredUtil5() {
    cov_1xl3psv51b().f[4]++;
    cov_1xl3psv51b().s[4]++;
    return true;
  }

  function myUncoveredUtil6() {
    cov_1xl3psv51b().f[5]++;
    cov_1xl3psv51b().s[5]++;
    return true;
  }
});
;

;define('my-app-ember-exam/config/environment', [], function() {
  var prefix = 'my-app-ember-exam';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(decodeURIComponent(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

;
          if (!runningTests) {
            require("my-app-ember-exam/app")["default"].create({"name":"my-app-ember-exam","version":"0.0.0+ce1535f6"});
          }
        
//# sourceMappingURL=my-app-ember-exam.map
