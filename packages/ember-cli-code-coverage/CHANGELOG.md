Version 9 of Highlight.js has reached EOL and is no longer supported.
Please upgrade or ask whatever dependency you are using to upgrade.
https://github.com/highlightjs/highlight.js/issues/2877

## v2.0.0-beta.2 (2021-10-28)

#### :boom: Breaking Change
* `ember-cli-code-coverage`
  * [#332](https://github.com/kategengler/ember-cli-code-coverage/pull/332) Move `sendCoverage` to be added by the host in `QUnit.done` ([@thoov](https://github.com/thoov))

#### :rocket: Enhancement
* `ember-cli-code-coverage`
  * [#333](https://github.com/kategengler/ember-cli-code-coverage/pull/333) Migrate to using native `fetch` instead of XMLHttpRequest ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Travis Hoover ([@thoov](https://github.com/thoov))


## v2.0.0-beta.1 (2021-10-26)

#### :boom: Breaking Change
* `ember-cli-code-coverage`
  * [#327](https://github.com/kategengler/ember-cli-code-coverage/pull/327) Re-architect plugin loading and asset detection logic (add Embroider support) ([@thoov](https://github.com/thoov))
  * [#325](https://github.com/kategengler/ember-cli-code-coverage/pull/325) Run ember-cli-upgrade to v3.28.1 ([@thoov](https://github.com/thoov))

#### :house: Internal
* `ember-cli-code-coverage`
  * [#326](https://github.com/kategengler/ember-cli-code-coverage/pull/326) Use volta-cli for node and yarn versioning ([@thoov](https://github.com/thoov))

#### Committers: 1
- Travis Hoover ([@thoov](https://github.com/thoov))


## v1.0.3 (2021-04-26)

#### :bug: Bug Fix
* `ember-cli-code-coverage`
  * [#311](https://github.com/kategengler/ember-cli-code-coverage/pull/311) Make sure to fire callback whenever handleCoverageResponse has fired ([@choongsan](https://github.com/choongsan))

#### :memo: Documentation
* [#301](https://github.com/kategengler/ember-cli-code-coverage/pull/301) Fix repo README ([@chrisvdp](https://github.com/chrisvdp))

#### Committers: 2
- Chris van der Ploeg ([@chrisvdp](https://github.com/chrisvdp))
- [@choongsan](https://github.com/choongsan)


## v1.0.2 (2020-10-14)

#### :bug: Bug Fix
* `ember-cli-code-coverage`
  * [#294](https://github.com/kategengler/ember-cli-code-coverage/pull/294) Fix missing/incorrect file paths for in-repo addons re-exporting files into the app that are also extended/overridden in the app. ([@GCheung55](https://github.com/GCheung55))

#### Committers: 1
- Garrick Cheung ([@GCheung55](https://github.com/GCheung55))


## v1.0.1 (2020-10-04)

#### :bug: Bug Fix
* `ember-cli-code-coverage`
  * [#293](https://github.com/kategengler/ember-cli-code-coverage/pull/293) Fix empty reports when path option to existing build is used ([@robinborst95](https://github.com/robinborst95))
  * [#290](https://github.com/kategengler/ember-cli-code-coverage/pull/290) Use in-repo addon's "root" property for includes location ([@mdeanjones](https://github.com/mdeanjones))

#### :house: Internal
* Other
  * [#291](https://github.com/kategengler/ember-cli-code-coverage/pull/291) Use Jest for testing ([@Turbo87](https://github.com/Turbo87))
* `ember-cli-code-coverage`
  * [#289](https://github.com/kategengler/ember-cli-code-coverage/pull/289) Convert to Monorepo ([@Turbo87](https://github.com/Turbo87))

#### Committers: 3
- Michael Jones ([@mdeanjones](https://github.com/mdeanjones))
- Robin Borst  ([@robinborst95](https://github.com/robinborst95))
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))


## v1.0.0 (2020-08-31)

#### :boom: Breaking Change
* [#252](https://github.com/kategengler/ember-cli-code-coverage/pull/252) Drop Node 8 and 11 support. ([@rwjblue](https://github.com/rwjblue))

#### :rocket: Enhancement
* [#263](https://github.com/kategengler/ember-cli-code-coverage/pull/263) Remove deprecated istanbul-api package. ([@rwjblue](https://github.com/rwjblue))
* [#261](https://github.com/kategengler/ember-cli-code-coverage/pull/261) Replace `extend` package with `Object.assign` ([@rwjblue](https://github.com/rwjblue))
* [#259](https://github.com/kategengler/ember-cli-code-coverage/pull/259) Remove lodash.concat dependency ([@rwjblue](https://github.com/rwjblue))
* [#258](https://github.com/kategengler/ember-cli-code-coverage/pull/258) Remove RSVP dependency. ([@rwjblue](https://github.com/rwjblue))
* [#255](https://github.com/kategengler/ember-cli-code-coverage/pull/255) Update dependencies to latest ([@rwjblue](https://github.com/rwjblue))

#### :bug: Bug Fix
* [#262](https://github.com/kategengler/ember-cli-code-coverage/pull/262) Fix issue with coverage report. ([@rwjblue](https://github.com/rwjblue))
* [#260](https://github.com/kategengler/ember-cli-code-coverage/pull/260) Ensure coverage build is parallelizable ([@rwjblue](https://github.com/rwjblue))
* [#257](https://github.com/kategengler/ember-cli-code-coverage/pull/257) Remove unused babel-plugin-transform-async-to-generator package ([@rwjblue](https://github.com/rwjblue))
* [#248](https://github.com/kategengler/ember-cli-code-coverage/pull/248) test cases fail with --path option in 1.0.0-beta.8 version ([@abishek-srinivasan](https://github.com/abishek-srinivasan))
* [#251](https://github.com/kategengler/ember-cli-code-coverage/pull/251) fix `InvalidStateError` exception ([@brokenalarms](https://github.com/brokenalarms))

#### :memo: Documentation
* [#273](https://github.com/kategengler/ember-cli-code-coverage/pull/273) Update instructions for Typescript integration to use 1.0.0-beta.9 ([@tomichal](https://github.com/tomichal))

#### :house: Internal
* [#282](https://github.com/kategengler/ember-cli-code-coverage/pull/282) Use `.includes()` instead of `.indexOf()` ([@Turbo87](https://github.com/Turbo87))
* [#281](https://github.com/kategengler/ember-cli-code-coverage/pull/281) Simplify `_isCoverageEnabled()` method ([@Turbo87](https://github.com/Turbo87))
* [#280](https://github.com/kategengler/ember-cli-code-coverage/pull/280) Remove unused `_parentName()` method ([@Turbo87](https://github.com/Turbo87))
* [#279](https://github.com/kategengler/ember-cli-code-coverage/pull/279) tests: Use async/await ([@Turbo87](https://github.com/Turbo87))
* [#278](https://github.com/kategengler/ember-cli-code-coverage/pull/278) mocha: Remove unnecessary Babel integration ([@Turbo87](https://github.com/Turbo87))
* [#277](https://github.com/kategengler/ember-cli-code-coverage/pull/277) Use shorthand methods and named functions ([@Turbo87](https://github.com/Turbo87))
* [#274](https://github.com/kategengler/ember-cli-code-coverage/pull/274) Use Prettier for code formatting ([@Turbo87](https://github.com/Turbo87))
* [#276](https://github.com/kategengler/ember-cli-code-coverage/pull/276) Use GitHub Actions for CI/CD ([@Turbo87](https://github.com/Turbo87))
* [#272](https://github.com/kategengler/ember-cli-code-coverage/pull/272) Fix `node-tests` ([@Turbo87](https://github.com/Turbo87))
* [#256](https://github.com/kategengler/ember-cli-code-coverage/pull/256) Remove `co` usage ([@rwjblue](https://github.com/rwjblue))
* [#254](https://github.com/kategengler/ember-cli-code-coverage/pull/254) Migrate to more modern linting setup. ([@rwjblue](https://github.com/rwjblue))
* [#253](https://github.com/kategengler/ember-cli-code-coverage/pull/253) Update release process ([@rwjblue](https://github.com/rwjblue))
* [#249](https://github.com/kategengler/ember-cli-code-coverage/pull/249) Update to 3.16 ember-cli blueprint ([@rajasegar](https://github.com/rajasegar))

#### Committers: 6
- Daniel ([@brokenalarms](https://github.com/brokenalarms))
- Rajasegar Chandran ([@rajasegar](https://github.com/rajasegar))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))
- [@tomichal](https://github.com/tomichal)
- abishek-srinivasan ([@abishek-srinivasan](https://github.com/abishek-srinivasan))


## v1.0.0-beta.9 (2020-02-22)

#### :rocket: Enhancement
* [#223](https://github.com/kategengler/ember-cli-code-coverage/pull/223) Support Typescript / ember-cli-typescript ([@lifeart](https://github.com/lifeart))

#### :bug: Bug Fix
* [#236](https://github.com/kategengler/ember-cli-code-coverage/pull/236) Ensure coverage collection accounts for addons with a custom `moduleName` implementation ([@axelerate](https://github.com/axelerate))

#### :house: Internal
* [#237](https://github.com/kategengler/ember-cli-code-coverage/pull/237) Merge pull request #237 from kategengler/rwjblue-patch-1 ([@rwjblue](https://github.com/rwjblue))

#### Committers: 4
- Alex Kanunnikov ([@lifeart](https://github.com/lifeart))
- Axel Hadfeg ([@axelerate](https://github.com/axelerate))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@ventuno](https://github.com/ventuno)


## v1.0.0-beta.8 (2019-01-02)

#### :bug: Bug Fix
* [#209](https://github.com/kategengler/ember-cli-code-coverage/pull/209) Update attach-middleware.js ([@adamjmcgrath](https://github.com/adamjmcgrath))
* [#206](https://github.com/kategengler/ember-cli-code-coverage/pull/206) fix build issues ([@adamjmcgrath](https://github.com/adamjmcgrath))

#### Committers: 1
- Adam Mcgrath ([@adamjmcgrath](https://github.com/adamjmcgrath))


## v1.0.0-beta.7 (2018-11-28)

#### :bug: Bug Fix
* [#199](https://github.com/kategengler/ember-cli-code-coverage/pull/199) fix: handle babel 7 absolute paths ([@adamjmcgrath](https://github.com/adamjmcgrath))

#### :memo: Documentation
* [#205](https://github.com/kategengler/ember-cli-code-coverage/pull/205) Add note about running tests with the path flag ([@astronomersiva](https://github.com/astronomersiva))

#### Committers: 3
- Adam Mcgrath ([@adamjmcgrath](https://github.com/adamjmcgrath))
- Alex Kanunnikov ([@lifeart](https://github.com/lifeart))
- Sivasubramanyam A ([@astronomersiva](https://github.com/astronomersiva))


## v1.0.0-beta.6 (2018-09-19)

#### :bug: Bug Fix
* [#194](https://github.com/kategengler/ember-cli-code-coverage/pull/194) Update babel-plugin-istanbul ([@rwwagner90](https://github.com/rwwagner90))

#### :house: Internal
* [#192](https://github.com/kategengler/ember-cli-code-coverage/pull/192) Do not publish coverage, tests, or .idea to npm ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 1
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))


## v1.0.0-beta.5 (2018-09-09)

#### :boom: Breaking Change
* [#190](https://github.com/kategengler/ember-cli-code-coverage/pull/190) Update to Ember 3.4, dropping support for Node 4 ([@rwwagner90](https://github.com/rwwagner90))
* [#186](https://github.com/kategengler/ember-cli-code-coverage/pull/186) upgrade istanbul-api to 2.0.1 ([@lennyburdette](https://github.com/lennyburdette))

#### :bug: Bug Fix
* [#188](https://github.com/kategengler/ember-cli-code-coverage/pull/188) Filter out in-repo addons that could not be found ([@jamescdavis](https://github.com/jamescdavis))
* [#182](https://github.com/kategengler/ember-cli-code-coverage/pull/182) Fix fileLookup is null in testemMiddleware ([@Gaurav0](https://github.com/Gaurav0))

#### :house: Internal
* [#191](https://github.com/kategengler/ember-cli-code-coverage/pull/191) Bump deps ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 4
- Gaurav Munjal ([@Gaurav0](https://github.com/Gaurav0))
- James C. Davis ([@jamescdavis](https://github.com/jamescdavis))
- Lenny Burdette ([@lennyburdette](https://github.com/lennyburdette))
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))


## v1.0.0-beta.4 (2018-04-26)

#### :rocket: Enhancement
* [#179](https://github.com/kategengler/ember-cli-code-coverage/pull/179) Removing unused dependency exists-sync which fixes the deprecation warning from ember-cli ([@selvaa89](https://github.com/selvaa89))
* [#164](https://github.com/kategengler/ember-cli-code-coverage/pull/164) Use the parent registry for determining JS extensions ([@dfreeman](https://github.com/dfreeman))
* [#169](https://github.com/kategengler/ember-cli-code-coverage/pull/169) Update babel-plugin-istanbul ([@charlesdemers](https://github.com/charlesdemers))
* [#163](https://github.com/kategengler/ember-cli-code-coverage/pull/163) Remove merge-coverage and explicit parallel option ([@adamjmcgrath](https://github.com/adamjmcgrath))

#### :bug: Bug Fix
* [#166](https://github.com/kategengler/ember-cli-code-coverage/pull/166) Revert "Remove merge-coverage and explicit parallel option (#163)" ([@adamjmcgrath](https://github.com/adamjmcgrath))

#### Committers: 4
- Adam Mcgrath ([@adamjmcgrath](https://github.com/adamjmcgrath))
- Charles Demers ([@charlesdemers](https://github.com/charlesdemers))
- Dan Freeman ([@dfreeman](https://github.com/dfreeman))
- Selvaraj Antonyraj ([@selvaa89](https://github.com/selvaa89))


## v1.0.0-beta.3 (2018-02-12)

#### :rocket: Enhancement
* [#162](https://github.com/kategengler/ember-cli-code-coverage/pull/162) Add tests for in-repo engines ([@rwwagner90](https://github.com/rwwagner90))
* [#160](https://github.com/kategengler/ember-cli-code-coverage/pull/160) Support for addon-test-support ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 1
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))


## v1.0.0-beta.2 (2018-02-06)

#### :rocket: Enhancement
* [#158](https://github.com/kategengler/ember-cli-code-coverage/pull/158) Start in-repo addon tests ([@rwwagner90](https://github.com/rwwagner90))

#### :house: Internal
* [#156](https://github.com/kategengler/ember-cli-code-coverage/pull/156) Make fixtures external ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 1
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))


## v1.0.0-beta.1 (2018-02-01)

#### :bug: Bug Fix
* [#153](https://github.com/kategengler/ember-cli-code-coverage/pull/153) Add back "Avoid throwing errors while requiring files for coverage" #64 ([@adamjmcgrath](https://github.com/adamjmcgrath))

#### :house: Internal
* [#157](https://github.com/kategengler/ember-cli-code-coverage/pull/157) Setup travis ci to release on pushed tag, add lerna-changelog ([@kategengler](https://github.com/kategengler))
* [#155](https://github.com/kategengler/ember-cli-code-coverage/pull/155) Upgrade deps ([@kategengler](https://github.com/kategengler))

#### Committers: 2
- Adam Mcgrath ([@adamjmcgrath](https://github.com/adamjmcgrath))
- Katie Gengler ([@kategengler](https://github.com/kategengler))

