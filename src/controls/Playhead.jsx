import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class Playhead extends PureComponent {
  static propTypes = {
    completion: PropTypes.number.isRequired,
  }

  render() {
    const { completion } = this.props;
    const style = {
      transform: `translateX(${completion * 100}%)`
    };
    return <div className='playhead' style={style} />
  }
}
