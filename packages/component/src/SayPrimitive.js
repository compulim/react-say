import PropTypes from 'prop-types';
import React from 'react';

import Context from './Context';

export default class Say extends React.Component {
  constructor(props) {
    super(props);

    this.handleBoundary = this.handleBoundary.bind(this);
    this.handleEnd = this.handleBoundary.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleStart = this.handleStart.bind(this);
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  handleBoundary(event) {
    !this.unmounted && this.props.onBoundary && this.props.onBoundary(event);
  }

  handleEnd(event) {
    !this.unmounted && this.props.onEnd && this.props.onEnd(event);
  }

  handleError(event) {
    !this.unmounted && this.props.onError && this.props.onError(event);
  }

  handleStart(event) {
    !this.unmounted && this.props.onStart && this.props.onStart(event);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.speak !== this.props.speak;
  }

  render() {
    const { lang, pitch, rate, speak: text, voice, volume } = this.props;

    return (
      <Context.Consumer>
        { context => context.speak({
            lang,
            onBoundary: this.handleBoundary,
            onEnd: this.handleEnd,
            onError: this.handleError,
            onStart: this.handleStart,
            pitch,
            rate,
            text,
            voice,
            volume
          })
        }
      </Context.Consumer>
    );
  }
}

Say.propTypes = {
  lang: PropTypes.string,
  pitch: PropTypes.number,
  rate: PropTypes.number,
  onBoundary: PropTypes.func,
  onEnd: PropTypes.func,
  onError: PropTypes.func,
  onStart: PropTypes.func,
  speak: PropTypes.string,
  voice: PropTypes.oneOfType([PropTypes.any, PropTypes.func]),
  volume: PropTypes.number
};
