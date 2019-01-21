import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import Playhead from './Playhead';
import { Play } from '../icons'

export default class Controls extends PureComponent {
  static propTypes = {
    togglePlay: PropTypes.func.isRequired,
    completion: PropTypes.number.isRequired,
  }

  render() {
    const { togglePlay, completion } = this.props;

    return (
      <Fragment>
        <div className="controls">
          <Play className="controls__play" onClick={togglePlay} />
        </div>

        <Playhead completion={completion} />
      </Fragment>
    );
  }
}