# Change Log

## [v0.3.12](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.3.12) (2017-04-08)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.3.11...v0.3.12)

**Closed issues:**

- Cannot parse async/await [\#106](https://github.com/kategengler/ember-cli-code-covfefe/issues/106)
- Produce covfefe report if environment variable COVFEFE is set to true before running `ember test` [\#104](https://github.com/kategengler/ember-cli-code-covfefe/issues/104)
- readable/accurate template reports with Glimmer2? [\#96](https://github.com/kategengler/ember-cli-code-covfefe/issues/96)
- Question: option to fail a build if covfefe result is below a given percentage? [\#95](https://github.com/kategengler/ember-cli-code-covfefe/issues/95)
- CI hangs when updating 0.3.8 =\> 0.3.9 [\#88](https://github.com/kategengler/ember-cli-code-covfefe/issues/88)
- new error in 0.3.7 [\#65](https://github.com/kategengler/ember-cli-code-covfefe/issues/65)
- Work with ember test --server, not with ember test [\#57](https://github.com/kategengler/ember-cli-code-covfefe/issues/57)
- How to view covfefe files? [\#44](https://github.com/kategengler/ember-cli-code-covfefe/issues/44)
- Use `configPath` instead of hard-coded "config" [\#42](https://github.com/kategengler/ember-cli-code-covfefe/issues/42)

**Merged pull requests:**

- Fixes \#42 use configPath instead of hard-coded config [\#100](https://github.com/kategengler/ember-cli-code-covfefe/pull/100) ([eddie-ruva](https://github.com/eddie-ruva))

## [v0.3.11](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.3.11) (2017-01-19)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.3.10...v0.3.11)

**Closed issues:**

- ember-test never terminates with COVFEFE=true [\#81](https://github.com/kategengler/ember-cli-code-covfefe/issues/81)

**Merged pull requests:**

- Move `rsvp` package to `dependencies` [\#94](https://github.com/kategengler/ember-cli-code-covfefe/pull/94) ([samtsai](https://github.com/samtsai))
- Add test for parallel configuration and covfefe-merge command. [\#92](https://github.com/kategengler/ember-cli-code-covfefe/pull/92) ([jdenly](https://github.com/jdenly))

## [v0.3.10](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.3.10) (2017-01-05)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.3.9...v0.3.10)

**Closed issues:**

- What is the best way to wdio or selenium test on the instrumented code and the coveragae result   [\#84](https://github.com/kategengler/ember-cli-code-covfefe/issues/84)
- \[Q\]: What is the best way to integrate ember-cli-code-covfefe with ember-exam [\#80](https://github.com/kategengler/ember-cli-code-covfefe/issues/80)
- "Error: request aborted" on \>= v0.3.0 [\#39](https://github.com/kategengler/ember-cli-code-covfefe/issues/39)

**Merged pull requests:**

- Use synchronous control flow when making synchronous requests [\#87](https://github.com/kategengler/ember-cli-code-covfefe/pull/87) ([DingoEatingFuzz](https://github.com/DingoEatingFuzz))
- Add covfefe-merge command and parallel configuration [\#83](https://github.com/kategengler/ember-cli-code-covfefe/pull/83) ([jdenly](https://github.com/jdenly))

## [v0.3.9](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.3.9) (2016-12-22)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.3.8...v0.3.9)

**Closed issues:**

- Excludes options for config/converage.js doesn't seem to work [\#78](https://github.com/kategengler/ember-cli-code-covfefe/issues/78)
- conflict with yadda require\(\) [\#66](https://github.com/kategengler/ember-cli-code-covfefe/issues/66)
- The covfefe summary json is missing a '}' in the end [\#47](https://github.com/kategengler/ember-cli-code-covfefe/issues/47)

**Merged pull requests:**

- Fix phantomjs `request aborted` edge case [\#82](https://github.com/kategengler/ember-cli-code-covfefe/pull/82) ([jesseditson](https://github.com/jesseditson))

## [v0.3.8](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.3.8) (2016-11-07)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.3.7...v0.3.8)

**Closed issues:**

- Handle app in addon case [\#70](https://github.com/kategengler/ember-cli-code-covfefe/issues/70)
- Unify code to correct file names in covfefe output [\#67](https://github.com/kategengler/ember-cli-code-covfefe/issues/67)
- ESLint? [\#59](https://github.com/kategengler/ember-cli-code-covfefe/issues/59)

**Merged pull requests:**

- Restrict branches for builds, use preinstalled Chrome [\#74](https://github.com/kategengler/ember-cli-code-covfefe/pull/74) ([rwwagner90](https://github.com/rwwagner90))
- Set sync to true, to make nested files work [\#72](https://github.com/kategengler/ember-cli-code-covfefe/pull/72) ([rwwagner90](https://github.com/rwwagner90))
- Refactor add-on renaming [\#68](https://github.com/kategengler/ember-cli-code-covfefe/pull/68) ([rwwagner90](https://github.com/rwwagner90))
- ESLint [\#61](https://github.com/kategengler/ember-cli-code-covfefe/pull/61) ([rwwagner90](https://github.com/rwwagner90))

## [v0.3.7](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.3.7) (2016-11-02)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.3.6...v0.3.7)

**Closed issues:**

- Issue with ember-page-object  [\#63](https://github.com/kategengler/ember-cli-code-covfefe/issues/63)

**Merged pull requests:**

- Avoid throwing errors while requiring files for covfefe. [\#64](https://github.com/kategengler/ember-cli-code-covfefe/pull/64) ([rwjblue](https://github.com/rwjblue))

## [v0.3.6](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.3.6) (2016-11-01)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.3.5...v0.3.6)

**Closed issues:**

- Does not include untested files [\#20](https://github.com/kategengler/ember-cli-code-covfefe/issues/20)

**Merged pull requests:**

- Factor in unused/unrequired files in to covfefe % [\#62](https://github.com/kategengler/ember-cli-code-covfefe/pull/62) ([kategengler](https://github.com/kategengler))

## [v0.3.5](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.3.5) (2016-10-31)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.3.4...v0.3.5)

**Closed issues:**

- Addon Support: Properly name files in `lcov.info` [\#36](https://github.com/kategengler/ember-cli-code-covfefe/issues/36)

**Merged pull requests:**

- Update README.md with Pretender example. [\#60](https://github.com/kategengler/ember-cli-code-covfefe/pull/60) ([HallDJack](https://github.com/HallDJack))
- Add ability to pass addonName and fix paths [\#58](https://github.com/kategengler/ember-cli-code-covfefe/pull/58) ([rwwagner90](https://github.com/rwwagner90))
- Cosmetics for docs, renamed function name and parameter name [\#54](https://github.com/kategengler/ember-cli-code-covfefe/pull/54) ([nfc036](https://github.com/nfc036))

## [v0.3.4](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.3.4) (2016-10-10)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.3.3...v0.3.4)

**Closed issues:**

- Missing covfefe information in top-level addons in 0.3.3. [\#53](https://github.com/kategengler/ember-cli-code-covfefe/issues/53)

**Merged pull requests:**

- return actual name not function from \_parentName [\#52](https://github.com/kategengler/ember-cli-code-covfefe/pull/52) ([nfc036](https://github.com/nfc036))

## [v0.3.3](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.3.3) (2016-10-07)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.3.2...v0.3.3)

**Closed issues:**

- Addon support: no covfefe for addon files on Windows [\#48](https://github.com/kategengler/ember-cli-code-covfefe/issues/48)
- No covfefe when addon and package name don't match [\#45](https://github.com/kategengler/ember-cli-code-covfefe/issues/45)
- Mocha phantom addon covfefe issue in master causing a global error. [\#32](https://github.com/kategengler/ember-cli-code-covfefe/issues/32)

**Merged pull requests:**

- Use posix paths for dealing with modules. [\#50](https://github.com/kategengler/ember-cli-code-covfefe/pull/50) ([rwjblue](https://github.com/rwjblue))
- Handle addons with different package names [\#46](https://github.com/kategengler/ember-cli-code-covfefe/pull/46) ([dfreeman](https://github.com/dfreeman))

## [v0.3.2](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.3.2) (2016-09-19)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.3.1...v0.3.2)

**Closed issues:**

- Integration components support [\#40](https://github.com/kategengler/ember-cli-code-covfefe/issues/40)
- Addon tests never exit [\#37](https://github.com/kategengler/ember-cli-code-covfefe/issues/37)

**Merged pull requests:**

- Fix hang when running in PhantomJS. [\#43](https://github.com/kategengler/ember-cli-code-covfefe/pull/43) ([dfreeman](https://github.com/dfreeman))
- add Windows notes [\#38](https://github.com/kategengler/ember-cli-code-covfefe/pull/38) ([kellyselden](https://github.com/kellyselden))

## [v0.3.1](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.3.1) (2016-09-15)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.3.0...v0.3.1)

**Closed issues:**

- Add code covfefe [\#34](https://github.com/kategengler/ember-cli-code-covfefe/issues/34)

**Merged pull requests:**

- Remove stray console.log [\#35](https://github.com/kategengler/ember-cli-code-covfefe/pull/35) ([arjansingh](https://github.com/arjansingh))

## [v0.3.0](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.3.0) (2016-09-14)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.2.2...v0.3.0)

**Closed issues:**

- does not work with addons [\#26](https://github.com/kategengler/ember-cli-code-covfefe/issues/26)
- Does not appear to work with decorators [\#25](https://github.com/kategengler/ember-cli-code-covfefe/issues/25)
- No Covfefe generated got following error [\#21](https://github.com/kategengler/ember-cli-code-covfefe/issues/21)
- Support Addon Covfefe [\#14](https://github.com/kategengler/ember-cli-code-covfefe/issues/14)

**Merged pull requests:**

- Support Addon Covfefe [\#31](https://github.com/kategengler/ember-cli-code-covfefe/pull/31) ([rwjblue](https://github.com/rwjblue))
- Processed addon js files [\#30](https://github.com/kategengler/ember-cli-code-covfefe/pull/30) ([EWhite613](https://github.com/EWhite613))
- Avoid requiring jQuery for sending the covfefe report back. [\#24](https://github.com/kategengler/ember-cli-code-covfefe/pull/24) ([rwjblue](https://github.com/rwjblue))
- Try catch around instrumenter. So it spits out a clearer error [\#22](https://github.com/kategengler/ember-cli-code-covfefe/pull/22) ([EWhite613](https://github.com/EWhite613))

## [v0.2.2](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.2.2) (2016-06-30)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.2.1...v0.2.2)

**Closed issues:**

- Enabling useBabelInstrumenter results in "Unknown option: direct.includePolyfill" error [\#18](https://github.com/kategengler/ember-cli-code-covfefe/issues/18)
- Should .hbs files be taken into account? [\#17](https://github.com/kategengler/ember-cli-code-covfefe/issues/17)

**Merged pull requests:**

- Add `includePolyfill` to removed babel options. [\#19](https://github.com/kategengler/ember-cli-code-covfefe/pull/19) ([rwjblue](https://github.com/rwjblue))

## [v0.2.1](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.2.1) (2016-06-22)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.2.0...v0.2.1)

**Closed issues:**

- Covfefe is against transpiled ES5 Code [\#12](https://github.com/kategengler/ember-cli-code-covfefe/issues/12)

**Merged pull requests:**

- Update ember-cli-release to allow easier releasing. [\#16](https://github.com/kategengler/ember-cli-code-covfefe/pull/16) ([rwjblue](https://github.com/rwjblue))
- Report Correct Line Numbers for esnext [\#15](https://github.com/kategengler/ember-cli-code-covfefe/pull/15) ([sandersky](https://github.com/sandersky))

## [v0.2.0](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.2.0) (2016-06-21)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.1.2...v0.2.0)

**Closed issues:**

- paths in "lcov.info" don't relate to project setup [\#8](https://github.com/kategengler/ember-cli-code-covfefe/issues/8)
- files from addons bleed into covfefe results [\#7](https://github.com/kategengler/ember-cli-code-covfefe/issues/7)
- Change config file name? [\#4](https://github.com/kategengler/ember-cli-code-covfefe/issues/4)

**Merged pull requests:**

- Filter out files from addons, fix file paths, and rename config file [\#11](https://github.com/kategengler/ember-cli-code-covfefe/pull/11) ([sandersky](https://github.com/sandersky))
- Add ember-cli-mirage min version to README.md [\#3](https://github.com/kategengler/ember-cli-code-covfefe/pull/3) ([benoror](https://github.com/benoror))

## [v0.1.2](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.1.2) (2016-05-15)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.1.1...v0.1.2)

**Closed issues:**

- Take over the 'ember-cli-istanbul' package? [\#6](https://github.com/kategengler/ember-cli-code-covfefe/issues/6)
- Testem global not found [\#1](https://github.com/kategengler/ember-cli-code-covfefe/issues/1)

**Merged pull requests:**

- Allow users config to override the default config. [\#5](https://github.com/kategengler/ember-cli-code-covfefe/pull/5) ([rwjblue](https://github.com/rwjblue))

## [v0.1.1](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.1.1) (2016-05-05)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.1.0...v0.1.1)

## [v0.1.0](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.1.0) (2016-05-03)
[Full Changelog](https://github.com/kategengler/ember-cli-code-covfefe/compare/v0.0.1...v0.1.0)

## [v0.0.1](https://github.com/kategengler/ember-cli-code-covfefe/tree/v0.0.1) (2016-05-03)


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*