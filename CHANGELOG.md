# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.0] - 2021-10-14

### Changed

- Added support of GitHub Codespaces, by [@compulim](https://github.com/compulim) in PR [#39](https://github.com/compulim/react-say/pull/39)
- Changed peer dependencies requirement to `react >= 16.8.6`, by [@compulim](https://github.com/compulim) in PR [#39](https://github.com/compulim/react-say/pull/39)
- Bumped dependencies, by [@compulim](https://github.com/compulim) in PR [#39](https://github.com/compulim/react-say/pull/39)
   - Production dependencies
      - [`classnames@2.3.1`](https://npmjs.com/package/classnames)
      - [`event-as-promise@1.0.5`](https://npmjs.com/package/event-as-promise)
      - [`memoize-one@5.2.1`](https://npmjs.com/package/memoize-one)
   - Non-production dependencies- [`@babel/runtime@7.15.4`](https://npmjs.com/package/@babel/runtime)
      - [`@babel/cli@7.15.7`](https://npmjs.com/package/@babel/cli)
      - [`@babel/core@7.15.8`](https://npmjs.com/package/@babel/core)
      - [`@babel/plugin-proposal-object-rest-spread@7.15.6`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
      - [`@babel/plugin-transform-runtime@7.15.8`](https://npmjs.com/package/@babel/plugin-transform-runtime)
      - [`@babel/preset-env@7.15.8`](https://npmjs.com/package/@babel/preset-env)
      - [`@babel/preset-react@7.14.5`](https://npmjs.com/package/@babel/preset-react)
      - [`jest@27.2.5`](https://npmjs.com/package/jest)
      - [`lerna@4.0.0`](https://npmjs.com/package/lerna)

## [2.0.1] - 2020-08-06

### Fixed

- Use `new CustomEvent()` and fallback to `document.createElement` for custom events, by [@compulim](https://github.com/compulim), in PR [#22](https://github.com/compulim/react-say/pull/22), [#23](https://github.com/compulim/react-say/pull/23), and [#24](https://github.com/compulim/react-say/pull/24)

## [2.0.0] - 2019-11-19

### Breaking changes

- Now requires React 16.8.6 or up
- Updates to `<Say>` component
   - Renamed prop `speak` to `text`
   - Will no longer renders its children
- Updates to `<SayButton>` component
   - Renamed prop `speak` to `text`
- `Composer` signature is being updated
   - New `synthesize` function to replace `speak` and `cancel`
      - When called, it will return `{ cancel: Function, promise: Promise }`
      - `cancel`, when called, will cancel the utterance. If the utterance is being synthesized, it will be stopped abruptly
      - `promise` will be resolved when the utterance is synthesized or errored
   - `cancel` and `speak` is removed because the newer `synthesize` function offer same functionality with simplified interface
- All React components now accepts `ponyfill` instead of `speechSynthesis` and `speechSynthesisUtterance`
   - Using browser speech would become as simple as `<Say ponyfill={ window }>`

### Changed

- Update build scripts to publish `/packages/component/package.json`, by [@compulim](https://github.com/compulim) in [PR #17](https://github.com/compulim/react-say/pull/17)
- Rework of all components, by [@compulim](https://github.com/compulim) in [PR #17](https://github.com/compulim/react-say/pull/17)
   - Support nested `<Context>` and `<Composer>`
      - Nested context will share the same queue, with different ponyfills
      - If not ponyfill is specified, it will inherit from its parent, or default to browser-based speech
      - Upgraded `<Composer>` component from class component to functional component
   - Added new `useSynthesize()` hook, which returns a function to queue an utterance
      - `synthesize(utteranceOrText: (SpeechSynthesisUtterance | string), progressFn: () => void) => void`
   - New `<SayUtterance>` component to synthesis `SpeechSynthesisUtterance` instead of text
      - `<Say>` is being refactored to use `<SayUtterance>` to simplify the codebase
      - `<SayButton>` is being refactored to use `<Say>` to simplify the codebase
   - 🔥 Updates to `<Say>` component
      - Renamed prop `speak` to `text`
      - Will no longer renders its children
   - 🔥 Updates to `<SayButton>` component
      - Renamed prop `speak` to `text`
   - 🔥 `Composer` signature is being updated
      - New `synthesize` function to replace `speak` and `cancel`
         - When called, it will return `{ cancel: Function, promise: Promise }`
         - `cancel`, when called, will cancel the utterance. If the utterance is being synthesized, it will be stopped abruptly
         - `promise` will be resolved when the utterance is synthesized or errored
      - `cancel` and `speak` is removed because the newer `synthesize` function offer same functionality with simplified interface
   - 🔥 All React components now accepts `ponyfill` instead of `speechSynthesis` and `speechSynthesisUtterance`
      - Using browser speech would become as simple as `<Say ponyfill={ window }>`
- Bumped dependencies in [PR #18](https://github.com/compulim/react-say/pull/18)
   - [`@babel/cli@7.7.0`](https://npmjs.com/package/@babel/cli)
   - [`@babel/core@7.7.2`](https://npmjs.com/package/@babel/core)
   - [`@babel/plugin-proposal-object-rest-spread@7.6.2`](https://npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
   - [`@babel/plugin-transform-runtime@7.6.2`](https://npmjs.com/package/@babel/plugin-transform-runtime)
   - [`@babel/preset-env@7.7.1`](https://npmjs.com/package/@babel/preset-env)
   - [`@babel/preset-react@7.7.0`](https://npmjs.com/package/@babel/preset-react)
   - [`@babel/runtime@7.7.2`](https://npmjs.com/package/@babel/runtime)
   - [`jest@24.9.0`](https://npmjs.com/package/jest)
   - [`memoize-one@5.1.1`](https://npmjs.com/package/memoize-one)

## [1.2.0] - 2019-05-28
### Changed
- Added babel-runtime dependency, by [@corinagum](https://github.com/corinagum) in [PR #5](https://github.com/compulim/react-say/pull/5)
- Bumped dependencies by `npm audit` in [PR #9](https://github.com/compulim/react-say/pull/9)
   - `@babel/core@7.4.5` and related packages
   - `jest@24.8.0`
   - `lerna@3.14.1`
   - `memoize-one@5.0.4`
   - `react-scripts@3.0.1`
   - `rimraf@2.6.3`

### Fixed
- Fix [#8](https://github.com/compulim/react-say/issues/8) by removing workaround for Chrome bug, in [PR #7](https://github.com/compulim/react-say/pull/7)
   - The workaround caused unnecessary kill-and-retry if the speech synthesizer legitimately took more than a second to signal `start` event

## [1.1.1] - 2018-10-31
### Changed
- Bump to [`event-as-promise@1.0.5`](https://npmjs.com/package/event-as-promise/v/1.0.5)

## [1.1.0] - 2018-10-28
### Added
- Utterance queue are now controlled by `<Composer>` instance, instead of native `speechSynthesis` for better browser compatibility
   - Chrome: does not fire `start` and `end` events if `speak`/`cancel` are called too fast
   - Safari: does not play audio or `start` event if the first utterance is not triggered by user event
- Unmounting elements will cancel the speech in progress or pending speech

### Changed
- Lerna bootstrap will no longer hoist
- Playground: Bump to [`react@16.6.0`](https://npmjs.com/package/react/v/16.6.0), [`react-dom@16.6.0`](https://npmjs.com/package/react-dom/v/16.6.0), and [`react-scripts@2.0.5`](https://npmjs.com/package/react-scripts/v/2.0.5)

### Fixed
- Null reference on `props.speechSynthesis`

## [1.0.0] - 2018-07-09
### Added
- Initial release
