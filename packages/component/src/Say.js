import PropTypes from 'prop-types';
import React from 'react';

import Context from './Context';

export default class Say extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.text !== this.props.text;
  }

  render() {
    const { props } = this;

    return (
      <Context.Consumer>
        { context => context.speak(props.text) }
      </Context.Consumer>
    );
  }
}

Say.propTypes = {
  text: PropTypes.string
};
