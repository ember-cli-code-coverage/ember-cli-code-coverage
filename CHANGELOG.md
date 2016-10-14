# Change Log

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