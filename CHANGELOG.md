# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.2.1](https://github.com/body-builder/jsass/compare/v1.2.0...v1.2.1) (2020-01-23)


### Bug Fixes

* **SassVarsToJS:** Handling Colors in SassMap keys correctly ([ced40ca](https://github.com/body-builder/jsass/commit/ced40ca9b5209758a326916b0796ef747ba02263))

## [1.2.0](https://github.com/body-builder/jsass/compare/v1.1.2...v1.2.0) (2019-12-04)


### Features

* **jsFunctionsToSass:** Automatic parameter resolution for Sass functions ([#5](https://github.com/body-builder/jsass/issues/5)) ([c4f61a2](https://github.com/body-builder/jsass/commit/c4f61a28ea3993b28a6247735fbc382bc3ad5cab))

### [1.1.2](https://github.com/body-builder/jsass/compare/v1.1.1...v1.1.2) (2019-11-15)


### Bug Fixes

* **JSFunctionsToSass:** Handling synchronous `renderSync()` correctly ([#3](https://github.com/body-builder/jsass/issues/3)) ([cc7581a](https://github.com/body-builder/jsass/commit/cc7581a30d19fa1eb1da5ae670b9b9e27c664728))

### 1.1.1 (2019-11-04)


### Bug Fixes

* **JSVarsToSassData:** The `options` parameters should never be `undefined` ([e8a866f](https://github.com/body-builder/jsass/commit/e8a866fb43f3598c2b4bc1a0c85aadb172516dda))

## 1.1.0 (2019-10-30)

### Features

* Adding support for Dart Sass ([ea9f65b5](https://github.com/body-builder/jsass/commit/ea9f65b5e27e1abd648f7f6743748a89456c1f33))

### API changes

* Changing the names (and file path) of many classes ([adefaa71](https://github.com/body-builder/jsass/commit/adefaa71c77a22d6f3f36e6ce5ce184bd90d98f6))

  To be more straightforward, as we are supporting not exclusively `node-sass`
  
  | Old name | New name |
  |---|---|
  | JSFunctionsToNodeSass | JSFunctionsToSass |
  | JSVarsToNodeSass | JSVarsToSass |
  | NodeSassVarsToJs | SassVarsToJS |
  | JSVarsToSassString | JSVarsToSassData |
  
  (We should create a new major version in normal case, but since the package is quite new (1wo), we make an exception this time. Hopefully we will not have to change the API in the near future.)

## 1.0.0 (2019-10-18)
Initial release
