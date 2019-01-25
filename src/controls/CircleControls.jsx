import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { playStatus } from '../utils';
import { TWOPI } from '../constants/math';
import { INNER_TO_OUTER_RATIO } from '../constants/Circles';
import { Play } from '../icons';

export default class Controls extends PureComponent {
  static propTypes = {
    status: playStatus.isRequired,
    togglePlay: PropTypes.func.isRequired,
    setCurrentTime: PropTypes.func.isRequired,
    completion: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }

  static defaultProps = {
    width: 800,
    height: 800,
  }

  state = {
    shouldShowCursor: false,
    cursorPosition: { x1: 0, y1: 0, x2: 0, y2: 0 },
  }

  constructor(props) {
    super(props);
    this.controlsEl = React.createRef();
    this.cursorEl = React.createRef();
  }

  handleMouseOver = (e) => {
    this.setState({ shouldShowCursor: true });
  }

  handleMouseMove = (e) => {
    const { controlsEl, cursorEl } = this;
    const { target } = e;
    if (controlsEl.current == null) return;
    if (target !== controlsEl.current && target !== cursorEl.current) {
      this.setState({ shouldShowCursor: false });
      return;
    }
    const { width, height } = this.props;
    const { x, y } = this.controlsEl.current.getBoundingClientRect();
    const { clientX, clientY } = e;
    const r = Math.min(width, height) / 2;
    const angle = Math.atan2(
      height - (clientY - y) - r,
      clientX - x - r,
    );
    const cursorX = r * Math.cos(angle) * INNER_TO_OUTER_RATIO;
    const cursorY = -r * Math.sin(angle) * INNER_TO_OUTER_RATIO;
    this.setState({ cursorPosition: {
      angle: angle < 0 ? angle + TWOPI : angle,
      x1: r,
      y1: r,
      x2: cursorX + r,
      y2: cursorY + r,
    }});
  }

  handleMouseLeave = (e) => {
    if (e.currentTarget !== this.controlsEl.current) return;
    this.setState({ shouldShowCursor: false });
  }

  setTime = (e) => {
    const { shouldShowCursor, cursorPosition } = this.state;
    if (!shouldShowCursor || this.controlsEl.current == null) return;
    const p = cursorPosition.angle / TWOPI;
    this.props.setCurrentTime(p);
  }

  togglePlay = (e) => {
    e.stopPropagation();
    this.props.togglePlay();
  }

  render() {
    const { completion, status, width, height } = this.props;
    const { cursorPosition, shouldShowCursor } = this.state;
    const radius = Math.min(width, height) / 2;
    const playheadX2 = Math.cos(completion * TWOPI) * (radius * INNER_TO_OUTER_RATIO) + radius;
    const playheadY2 = height / 2 - Math.sin(completion * TWOPI) * (radius * INNER_TO_OUTER_RATIO);

    return (
      <svg
        className="controls"
        viewBox={`0 0 ${width} ${height}`}
        onMouseOver={this.handleMouseOver}
        onMouseLeave={this.handleMouseLeave}
        onMouseMove={this.handleMouseMove}
        onClick={this.setTime}
        ref={this.controlsEl}
      >
        <line className='controls__playhead' x1={radius} y1={radius} x2={playheadX2} y2={playheadY2} strokeWidth='2' />

        {
          shouldShowCursor &&
            <line
              className='controls__cursor'
              x1={cursorPosition.x1}
              y1={cursorPosition.y1}
              x2={cursorPosition.x2}
              y2={cursorPosition.y2}
              strokeWidth='2'
              onClick={this.setTime}
              ref={this.cursorEl}
            />
        }
        
        <Play
          className='controls__play'
          status={status}
          x={radius - 50}
          y={radius - 50}
          onClick={this.togglePlay}
        />
      </svg>
    );
  }
}