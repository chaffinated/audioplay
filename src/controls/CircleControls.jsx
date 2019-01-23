import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { playStatus } from '../utils';
import { TWOPI } from '../constants/math';
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
    cursorPosition: 0,
  }

  constructor(props) {
    super(props);
    this.controlsEl = React.createRef();
  }

  handleMouseOver = (e) => {
    this.setState({ shouldShowCursor: true });
  }

  handleMouseMove = (e) => {
    if (this.controlsEl.current == null) return;
    const { width, height } = this.props;
    const { x, y } = this.controlsEl.current.getBoundingClientRect();
    const { clientX, clientY } = e;
    const r = Math.min(width, height) / 2;
    const angle = Math.atan2(
      height - (clientY - y) - r,
      clientX - x - r,
    );
    const cursorX = r * Math.cos(angle);
    const cursorY = -r * Math.sin(angle);
    this.setState({ cursorPosition: {
      angle,
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
    const playheadX2 = Math.cos(completion * TWOPI) * radius + radius;
    const playheadY2 = height / 2 - Math.sin(completion * TWOPI) * radius;

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
        <defs>
          <mask id="paused">
            <rect x="0" y="0" width="100" height="100" fill="white" />
            <polygon points="36 30, 70 50, 70 50, 36 70" fill="black" />
          </mask>
          <mask id="playing">
            <rect x="0" y="0" width="100" height="100" fill="white" />
            <polygon points="36 30, 70 30, 70 70, 36 70" fill="black" />
          </mask>
        </defs>

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
            />
        }
        
        <Play className='controls__play' status={status} x={radius - 50} y={radius - 50} onClick={this.togglePlay} />
      </svg>
    );
  }
}