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
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))
- [@robinborst95](https://github.com/robinborst95)

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


## v1.0.0-beta.8 (2019-01-02)

#### :bug: Bug Fix
* [#206](https://github.com/kategengler/ember-cli-code-coverage/pull/206) fix build issues. ([@adamjmcgrath](https://github.com/adamjmcgrath))

#### Committers: 1
- Adam Mcgrath ([adamjmcgrath](https://github.com/adamjmcgrath))

## v1.0.0-beta.7 (2018-11-28)

#### :bug: Bug Fix
* [#199](https://github.com/kategengler/ember-cli-code-coverage/pull/199) fix: handle babel 7 absolute paths. ([@adamjmcgrath](https://github.com/adamjmcgrath))

#### Committers: 3
- Adam Mcgrath ([adamjmcgrath](https://github.com/adamjmcgrath))
- Alex Kanunnikov ([lifeart](https://github.com/lifeart))
- Sivasubramanyam A ([astronomersiva](https://github.com/astronomersiva))

## v1.0.0-beta.6 (2018-09-19)

#### :bug: Bug Fix
* [#194](https://github.com/kategengler/ember-cli-code-coverage/pull/194) Update babel-plugin-istanbul. ([@rwwagner90](https://github.com/rwwagner90))

#### :house: Internal
* [#192](https://github.com/kategengler/ember-cli-code-coverage/pull/192) Do not publish coverage, tests, or .idea to npm. ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 1
- Robert Wagner ([rwwagner90](https://github.com/rwwagner90))

## v1.0.0-beta.5 (2018-09-09)

#### :boom: Breaking Change
* [#190](https://github.com/kategengler/ember-cli-code-coverage/pull/190) Update to Ember 3.4, dropping support for Node 4. ([@rwwagner90](https://github.com/rwwagner90))
* [#186](https://github.com/kategengler/ember-cli-code-coverage/pull/186) upgrade istanbul-api to 2.0.1. ([@lennyburdette](https://github.com/lennyburdette))

#### :bug: Bug Fix
* [#188](https://github.com/kategengler/ember-cli-code-coverage/pull/188) Filter out in-repo addons that could not be found. ([@jamescdavis](https://github.com/jamescdavis))
* [#182](https://github.com/kategengler/ember-cli-code-coverage/pull/182) Fix fileLookup is null in testemMiddleware. ([@Gaurav0](https://github.com/Gaurav0))

#### :house: Internal
* [#191](https://github.com/kategengler/ember-cli-code-coverage/pull/191) Bump deps. ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 4
- Gaurav Munjal ([Gaurav0](https://github.com/Gaurav0))
- James C. Davis ([jamescdavis](https://github.com/jamescdavis))
- Lenny Burdette ([lennyburdette](https://github.com/lennyburdette))
- Robert Wagner ([rwwagner90](https://github.com/rwwagner90))

## v1.0.0-beta.4 (2018-04-26)

#### :rocket: Enhancement
* [#179](https://github.com/kategengler/ember-cli-code-coverage/pull/179) Removing unused dependency exists-sync which fixes the deprecation warning from ember-cli. ([@selvaa89](https://github.com/selvaa89))
* [#164](https://github.com/kategengler/ember-cli-code-coverage/pull/164) Use the parent registry for determining JS extensions. ([@dfreeman](https://github.com/dfreeman))
* [#169](https://github.com/kategengler/ember-cli-code-coverage/pull/169) Update babel-plugin-istanbul. ([@charlesdemers](https://github.com/charlesdemers))
* [#163](https://github.com/kategengler/ember-cli-code-coverage/pull/163) Remove merge-coverage and explicit parallel option. ([@adamjmcgrath](https://github.com/adamjmcgrath))

#### :bug: Bug Fix
* [#166](https://github.com/kategengler/ember-cli-code-coverage/pull/166) Revert "Remove merge-coverage and explicit parallel option (#163)". ([@adamjmcgrath](https://github.com/adamjmcgrath))

#### Committers: 4
- Adam Mcgrath ([adamjmcgrath](https://github.com/adamjmcgrath))
- Charles Demers ([charlesdemers](https://github.com/charlesdemers))
- Dan Freeman ([dfreeman](https://github.com/dfreeman))
- Selvaraj Antonyraj ([selvaa89](https://github.com/selvaa89))

## v1.0.0-beta.3 (2018-02-13)

#### :rocket: Enhancement
* [#162](https://github.com/kategengler/ember-cli-code-coverage/pull/162) Add tests for in-repo engines. ([@rwwagner90](https://github.com/rwwagner90))
* [#160](https://github.com/kategengler/ember-cli-code-coverage/pull/160) Support for addon-test-support. ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 1
- Robert Wagner ([rwwagner90](https://github.com/rwwagner90))

## v1.0.0-beta.2 (2018-02-06)

#### :rocket: Enhancement
* [#158](https://github.com/kategengler/ember-cli-code-coverage/pull/158) Add in-repo addon support and tests. ([@rwwagner90](https://github.com/rwwagner90))

#### :house: Internal
* [#156](https://github.com/kategengler/ember-cli-code-coverage/pull/156) Make fixtures external. ([@rwwagner90](https://github.com/rwwagner90))

#### Committers: 2
- Adam Mcgrath ([adamjmcgrath](https://github.com/adamjmcgrath))
- Robert Wagner ([rwwagner90](https://github.com/rwwagner90))

## v1.0.0-beta.1 (2018-02-01)

#### :bug: Bug Fix
* [#153](https://github.com/kategengler/ember-cli-code-coverage/pull/153) Add back "Avoid throwing errors while requiring files for coverage" #64. ([@adamjmcgrath](https://github.com/adamjmcgrath))

#### :house: Internal
* [#157](https://github.com/kategengler/ember-cli-code-coverage/pull/157) Setup travis ci to release on pushed tag, add lerna-changelog. ([@kategengler](https://github.com/kategengler))
* [#155](https://github.com/kategengler/ember-cli-code-coverage/pull/155) Upgrade deps. ([@kategengler](https://github.com/kategengler))

#### Committers: 2
- Adam Mcgrath ([adamjmcgrath](https://github.com/adamjmcgrath))
- Katie Gengler ([kategengler](https://github.com/kategengler))

## v1.0.0-beta.0

### Pull Requests

- [#145](https://github.com/kategengler/ember-cli-code-coverage/pull/145)  [WIP] Refactor to use babel-plugin-istanbul cont.  *by [adamjmcgrath](https://github.com/adamjmcgrath)*
- [#141](https://github.com/kategengler/ember-cli-code-coverage/pull/141)  [WIP] Refactor to use babel-plugin-istanbul  *by [rwjblue](https://github.com/rwjblue)*

[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.4.0...v0.4.1)

**Merged pull requests:**

- Fixes the hanging issue of \#88 [\#90](https://github.com/kategengler/ember-cli-code-coverage/pull/90) ([ming-codes](https://github.com/ming-codes))

## [v0.4.1](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.4.1) (2017-06-27)

## [v0.4.0](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.4.0) (2017-06-27)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.3.12...v0.4.0)

**Closed issues:**

- Enabling coverage with enabled Babel plugin fails [\#123](https://github.com/kategengler/ember-cli-code-coverage/issues/123)
- ember coverage-merge does not merge the coverage report generated from different test type say unit and functional? [\#122](https://github.com/kategengler/ember-cli-code-coverage/issues/122)
- Running with `COVERAGE=true` generates additional tests that fail [\#114](https://github.com/kategengler/ember-cli-code-coverage/issues/114)
- Plugin fails with ember-cli 2.13 and useBabelInstrumenter: true [\#111](https://github.com/kategengler/ember-cli-code-coverage/issues/111)
- Parsing async/await crashes [\#108](https://github.com/kategengler/ember-cli-code-coverage/issues/108)
- Coverage failing with version 0.3.6 and up [\#75](https://github.com/kategengler/ember-cli-code-coverage/issues/75)

**Merged pull requests:**

- \[Fixes \#111\] Update dependencies, get babel instrumenter working [\#115](https://github.com/kategengler/ember-cli-code-coverage/pull/115) ([paulcwatts](https://github.com/paulcwatts))
- Improve ES7 error message [\#109](https://github.com/kategengler/ember-cli-code-coverage/pull/109) ([sukima](https://github.com/sukima))

## [v0.3.12](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.3.12) (2017-04-08)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.3.11...v0.3.12)

**Closed issues:**

- Cannot parse async/await [\#106](https://github.com/kategengler/ember-cli-code-coverage/issues/106)
- Produce coverage report if environment variable COVERAGE is set to true before running `ember test` [\#104](https://github.com/kategengler/ember-cli-code-coverage/issues/104)
- readable/accurate template reports with Glimmer2? [\#96](https://github.com/kategengler/ember-cli-code-coverage/issues/96)
- Question: option to fail a build if coverage result is below a given percentage? [\#95](https://github.com/kategengler/ember-cli-code-coverage/issues/95)
- CI hangs when updating 0.3.8 =\> 0.3.9 [\#88](https://github.com/kategengler/ember-cli-code-coverage/issues/88)
- new error in 0.3.7 [\#65](https://github.com/kategengler/ember-cli-code-coverage/issues/65)
- Work with ember test --server, not with ember test [\#57](https://github.com/kategengler/ember-cli-code-coverage/issues/57)
- How to view coverage files? [\#44](https://github.com/kategengler/ember-cli-code-coverage/issues/44)
- Use `configPath` instead of hard-coded "config" [\#42](https://github.com/kategengler/ember-cli-code-coverage/issues/42)

**Merged pull requests:**

- Fixes \#42 use configPath instead of hard-coded config [\#100](https://github.com/kategengler/ember-cli-code-coverage/pull/100) ([eddie-ruva](https://github.com/eddie-ruva))

## [v0.3.11](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.3.11) (2017-01-19)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.3.10...v0.3.11)

**Closed issues:**

- ember-test never terminates with COVERAGE=true [\#81](https://github.com/kategengler/ember-cli-code-coverage/issues/81)

**Merged pull requests:**

- Move `rsvp` package to `dependencies` [\#94](https://github.com/kategengler/ember-cli-code-coverage/pull/94) ([samtsai](https://github.com/samtsai))
- Add test for parallel configuration and coverage-merge command. [\#92](https://github.com/kategengler/ember-cli-code-coverage/pull/92) ([jdenly](https://github.com/jdenly))

## [v0.3.10](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.3.10) (2017-01-05)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.3.9...v0.3.10)

**Closed issues:**

- What is the best way to wdio or selenium test on the instrumented code and the coveragae result   [\#84](https://github.com/kategengler/ember-cli-code-coverage/issues/84)
- \[Q\]: What is the best way to integrate ember-cli-code-coverage with ember-exam [\#80](https://github.com/kategengler/ember-cli-code-coverage/issues/80)
- "Error: request aborted" on \>= v0.3.0 [\#39](https://github.com/kategengler/ember-cli-code-coverage/issues/39)

**Merged pull requests:**

- Use synchronous control flow when making synchronous requests [\#87](https://github.com/kategengler/ember-cli-code-coverage/pull/87) ([DingoEatingFuzz](https://github.com/DingoEatingFuzz))
- Add coverage-merge command and parallel configuration [\#83](https://github.com/kategengler/ember-cli-code-coverage/pull/83) ([jdenly](https://github.com/jdenly))

## [v0.3.9](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.3.9) (2016-12-22)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.3.8...v0.3.9)

**Closed issues:**

- Excludes options for config/converage.js doesn't seem to work [\#78](https://github.com/kategengler/ember-cli-code-coverage/issues/78)
- conflict with yadda require\(\) [\#66](https://github.com/kategengler/ember-cli-code-coverage/issues/66)
- The coverage summary json is missing a '}' in the end [\#47](https://github.com/kategengler/ember-cli-code-coverage/issues/47)

**Merged pull requests:**

- Fix phantomjs `request aborted` edge case [\#82](https://github.com/kategengler/ember-cli-code-coverage/pull/82) ([jesseditson](https://github.com/jesseditson))

## [v0.3.8](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.3.8) (2016-11-07)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.3.7...v0.3.8)

**Closed issues:**

- Handle app in addon case [\#70](https://github.com/kategengler/ember-cli-code-coverage/issues/70)
- Unify code to correct file names in coverage output [\#67](https://github.com/kategengler/ember-cli-code-coverage/issues/67)
- ESLint? [\#59](https://github.com/kategengler/ember-cli-code-coverage/issues/59)

**Merged pull requests:**

- Restrict branches for builds, use preinstalled Chrome [\#74](https://github.com/kategengler/ember-cli-code-coverage/pull/74) ([rwwagner90](https://github.com/rwwagner90))
- Set sync to true, to make nested files work [\#72](https://github.com/kategengler/ember-cli-code-coverage/pull/72) ([rwwagner90](https://github.com/rwwagner90))
- Refactor add-on renaming [\#68](https://github.com/kategengler/ember-cli-code-coverage/pull/68) ([rwwagner90](https://github.com/rwwagner90))
- ESLint [\#61](https://github.com/kategengler/ember-cli-code-coverage/pull/61) ([rwwagner90](https://github.com/rwwagner90))

## [v0.3.7](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.3.7) (2016-11-02)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.3.6...v0.3.7)

**Closed issues:**

- Issue with ember-page-object  [\#63](https://github.com/kategengler/ember-cli-code-coverage/issues/63)

**Merged pull requests:**

- Avoid throwing errors while requiring files for coverage. [\#64](https://github.com/kategengler/ember-cli-code-coverage/pull/64) ([rwjblue](https://github.com/rwjblue))

## [v0.3.6](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.3.6) (2016-11-01)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.3.5...v0.3.6)

**Closed issues:**

- Does not include untested files [\#20](https://github.com/kategengler/ember-cli-code-coverage/issues/20)

**Merged pull requests:**

- Factor in unused/unrequired files in to coverage % [\#62](https://github.com/kategengler/ember-cli-code-coverage/pull/62) ([kategengler](https://github.com/kategengler))

## [v0.3.5](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.3.5) (2016-10-31)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.3.4...v0.3.5)

**Closed issues:**

- Addon Support: Properly name files in `lcov.info` [\#36](https://github.com/kategengler/ember-cli-code-coverage/issues/36)

**Merged pull requests:**

- Update README.md with Pretender example. [\#60](https://github.com/kategengler/ember-cli-code-coverage/pull/60) ([HallDJack](https://github.com/HallDJack))
- Add ability to pass addonName and fix paths [\#58](https://github.com/kategengler/ember-cli-code-coverage/pull/58) ([rwwagner90](https://github.com/rwwagner90))
- Cosmetics for docs, renamed function name and parameter name [\#54](https://github.com/kategengler/ember-cli-code-coverage/pull/54) ([nfc036](https://github.com/nfc036))

## [v0.3.4](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.3.4) (2016-10-10)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.3.3...v0.3.4)

**Closed issues:**

- Missing coverage information in top-level addons in 0.3.3. [\#53](https://github.com/kategengler/ember-cli-code-coverage/issues/53)

**Merged pull requests:**

- return actual name not function from \_parentName [\#52](https://github.com/kategengler/ember-cli-code-coverage/pull/52) ([nfc036](https://github.com/nfc036))

## [v0.3.3](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.3.3) (2016-10-07)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.3.2...v0.3.3)

**Closed issues:**

- Addon support: no coverage for addon files on Windows [\#48](https://github.com/kategengler/ember-cli-code-coverage/issues/48)
- No coverage when addon and package name don't match [\#45](https://github.com/kategengler/ember-cli-code-coverage/issues/45)
- Mocha phantom addon coverage issue in master causing a global error. [\#32](https://github.com/kategengler/ember-cli-code-coverage/issues/32)

**Merged pull requests:**

- Use posix paths for dealing with modules. [\#50](https://github.com/kategengler/ember-cli-code-coverage/pull/50) ([rwjblue](https://github.com/rwjblue))
- Handle addons with different package names [\#46](https://github.com/kategengler/ember-cli-code-coverage/pull/46) ([dfreeman](https://github.com/dfreeman))

## [v0.3.2](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.3.2) (2016-09-19)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.3.1...v0.3.2)

**Closed issues:**

- Integration components support [\#40](https://github.com/kategengler/ember-cli-code-coverage/issues/40)
- Addon tests never exit [\#37](https://github.com/kategengler/ember-cli-code-coverage/issues/37)

**Merged pull requests:**

- Fix hang when running in PhantomJS. [\#43](https://github.com/kategengler/ember-cli-code-coverage/pull/43) ([dfreeman](https://github.com/dfreeman))
- add Windows notes [\#38](https://github.com/kategengler/ember-cli-code-coverage/pull/38) ([kellyselden](https://github.com/kellyselden))

## [v0.3.1](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.3.1) (2016-09-15)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.3.0...v0.3.1)

**Closed issues:**

- Add code coverage [\#34](https://github.com/kategengler/ember-cli-code-coverage/issues/34)

**Merged pull requests:**

- Remove stray console.log [\#35](https://github.com/kategengler/ember-cli-code-coverage/pull/35) ([arjansingh](https://github.com/arjansingh))

## [v0.3.0](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.3.0) (2016-09-14)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.2.2...v0.3.0)

**Closed issues:**

- does not work with addons [\#26](https://github.com/kategengler/ember-cli-code-coverage/issues/26)
- Does not appear to work with decorators [\#25](https://github.com/kategengler/ember-cli-code-coverage/issues/25)
- No Coverage generated got following error [\#21](https://github.com/kategengler/ember-cli-code-coverage/issues/21)
- Support Addon Coverage [\#14](https://github.com/kategengler/ember-cli-code-coverage/issues/14)

**Merged pull requests:**

- Support Addon Coverage [\#31](https://github.com/kategengler/ember-cli-code-coverage/pull/31) ([rwjblue](https://github.com/rwjblue))
- Processed addon js files [\#30](https://github.com/kategengler/ember-cli-code-coverage/pull/30) ([EWhite613](https://github.com/EWhite613))
- Avoid requiring jQuery for sending the coverage report back. [\#24](https://github.com/kategengler/ember-cli-code-coverage/pull/24) ([rwjblue](https://github.com/rwjblue))
- Try catch around instrumenter. So it spits out a clearer error [\#22](https://github.com/kategengler/ember-cli-code-coverage/pull/22) ([EWhite613](https://github.com/EWhite613))

## [v0.2.2](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.2.2) (2016-06-30)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.2.1...v0.2.2)

**Closed issues:**

- Enabling useBabelInstrumenter results in "Unknown option: direct.includePolyfill" error [\#18](https://github.com/kategengler/ember-cli-code-coverage/issues/18)
- Should .hbs files be taken into account? [\#17](https://github.com/kategengler/ember-cli-code-coverage/issues/17)

**Merged pull requests:**

- Add `includePolyfill` to removed babel options. [\#19](https://github.com/kategengler/ember-cli-code-coverage/pull/19) ([rwjblue](https://github.com/rwjblue))

## [v0.2.1](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.2.1) (2016-06-22)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.2.0...v0.2.1)

**Closed issues:**

- Coverage is against transpiled ES5 Code [\#12](https://github.com/kategengler/ember-cli-code-coverage/issues/12)

**Merged pull requests:**

- Update ember-cli-release to allow easier releasing. [\#16](https://github.com/kategengler/ember-cli-code-coverage/pull/16) ([rwjblue](https://github.com/rwjblue))
- Report Correct Line Numbers for esnext [\#15](https://github.com/kategengler/ember-cli-code-coverage/pull/15) ([sandersky](https://github.com/sandersky))

## [v0.2.0](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.2.0) (2016-06-21)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.1.2...v0.2.0)

**Closed issues:**

- paths in "lcov.info" don't relate to project setup [\#8](https://github.com/kategengler/ember-cli-code-coverage/issues/8)
- files from addons bleed into coverage results [\#7](https://github.com/kategengler/ember-cli-code-coverage/issues/7)
- Change config file name? [\#4](https://github.com/kategengler/ember-cli-code-coverage/issues/4)

**Merged pull requests:**

- Filter out files from addons, fix file paths, and rename config file [\#11](https://github.com/kategengler/ember-cli-code-coverage/pull/11) ([sandersky](https://github.com/sandersky))
- Add ember-cli-mirage min version to README.md [\#3](https://github.com/kategengler/ember-cli-code-coverage/pull/3) ([benoror](https://github.com/benoror))

## [v0.1.2](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.1.2) (2016-05-15)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.1.1...v0.1.2)

**Closed issues:**

- Take over the 'ember-cli-istanbul' package? [\#6](https://github.com/kategengler/ember-cli-code-coverage/issues/6)
- Testem global not found [\#1](https://github.com/kategengler/ember-cli-code-coverage/issues/1)

**Merged pull requests:**

- Allow users config to override the default config. [\#5](https://github.com/kategengler/ember-cli-code-coverage/pull/5) ([rwjblue](https://github.com/rwjblue))

## [v0.1.1](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.1.1) (2016-05-05)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.1.0...v0.1.1)

## [v0.1.0](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.1.0) (2016-05-03)
[Full Changelog](https://github.com/kategengler/ember-cli-code-coverage/compare/v0.0.1...v0.1.0)

## [v0.0.1](https://github.com/kategengler/ember-cli-code-coverage/tree/v0.0.1) (2016-05-03)


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*
