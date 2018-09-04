import PropTypes from 'prop-types';
import React from 'react';

import Composer from './Composer';

class SayButton extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);

    this.state = {
      busy: false,
      id: Date.now() + Math.random()
    };
  }

  componentWillUnmount() {
    this.props.context.cancel(this.state.id);
  }

  handleClick() {
    const { props, state } = this;

    props.onClick && props.onClick(event);

    this.setState(() => ({ busy: true }), async () => {
      await props.context.speak({
        id: state.id,
        lang: props.lang,
        onBoundary: props.onBoundary,
        onEnd: props.onEnd,
        onError: props.onError,
        onStart: props.onStart,
        pitch: props.pitch,
        rate: props.rate,
        text: props.speak,
        voice: props.voice,
        volume: props.volume
      });

      this.setState(() => ({
        busy: false
      }));
    });
  }

  render() {
    const {
      props: { children, disabled },
      state: { busy }
    } = this;

    return (
      <button
        disabled={ typeof disabled === 'boolean' ? disabled : busy }
        onClick={ this.handleClick }
      >
        { children }
      </button>
    );
  }
}

const SayButtonWithContext = props =>
  <Composer
    speechSynthesis={ props.speechSynthesis }
    speechSynthesisUtterance={ props.speechSynthesisUtterance }
  >
    { context =>
      <SayButton context={ context } { ...props } />
    }
  </Composer>

SayButtonWithContext.propTypes = {
  lang: PropTypes.string,
  onBoundary: PropTypes.func,
  onEnd: PropTypes.func,
  onError: PropTypes.func,
  onStart: PropTypes.func,
  pitch: PropTypes.number,
  rate: PropTypes.number,
  speak: PropTypes.string,
  voice: PropTypes.oneOfType([PropTypes.any, PropTypes.func]),
  volume: PropTypes.number
};

export default SayButtonWithContext
