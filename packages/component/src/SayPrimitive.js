import PropTypes from 'prop-types';
import React from 'react';

import Context from './Context';

class SayPrimitive extends React.Component {
  constructor(props) {
    super(props);

    this.handleBoundary = this.handleBoundary.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleStart = this.handleStart.bind(this);

    this.state = { id: Date.now() + Math.random() };
  }

  componentWillUnmount() {
    // TODO: Should dequeue self on unmount
    this.unmounted = true;

    this.props.context.cancel(this.state.id).catch(err => 0);
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
    (async () => {
      const { context, lang, pitch, rate, speak: text, voice, volume } = this.props;
      const { id } = this.state;

      context.speak({
        id,
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
      });
    })().catch(err => console.error(err));

    return false;
  }
}

const SayPrimitiveWithContext = props =>
  <Context.Consumer>
    { context =>
      <SayPrimitive
        context={ context }
        { ...props }
      >
        { props.children }
      </SayPrimitive>
    }
  </Context.Consumer>

SayPrimitiveWithContext.propTypes = {
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

export default SayPrimitiveWithContext
