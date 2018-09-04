import PropTypes from 'prop-types';
import React from 'react';

import Context from './Context';

export default class Say extends React.Component {
  constructor(props) {
    super(props);

    this.handleBoundary = this.handleBoundary.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleStart = this.handleStart.bind(this);

    this.state = { uniqueID: Date.now() + Math.random() };
  }

  componentWillUnmount() {
    // TODO: Should dequeue self on unmount
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
    const { exclusive, lang, pitch, rate, speak: text, voice, volume } = this.props;
    const { uniqueID } = this.state;

    return (
      <Context.Consumer>
        { context => {
            if (exclusive) {
              context.cancel();
            }

            context.speak({
              lang,
              onBoundary: this.handleBoundary,
              onEnd: this.handleEnd,
              onError: this.handleError,
              onStart: this.handleStart,
              pitch,
              rate,
              text,
              uniqueID,
              voice,
              volume
            });

            return false;
        } }
      </Context.Consumer>
    );
  }
}

Say.propTypes = {
  exclusive: PropTypes.bool,
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
