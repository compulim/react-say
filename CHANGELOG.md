# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- `exclusive` props: will cancel other utterances on speak

### Changed
- Lerna bootstrap will no longer hoist
- Utterance queue are now controlled by `<Composer>` instead of `speechSynthesis` for better compatibility
   - Chrome does not fire `start` and `end` events if `speak`/`cancel` are called too fast

## [1.0.0] - 2018-07-09
### Added
- Initial release
