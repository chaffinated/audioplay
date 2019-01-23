import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import { Play } from '../icons'
import PlayStatus from '../constants/PlayStatus';
import { playStatus } from '../utils';

export default class Controls extends PureComponent {
  static propTypes = {
    status: playStatus.isRequired,
    togglePlay: PropTypes.func.isRequired,
    setCurrentTime: PropTypes.func.isRequired,
    completion: PropTypes.number.isRequired,
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
    const clientX = e.clientX;
    const elRect = this.controlsEl.current.getBoundingClientRect();
    const elX = elRect.x;
    this.setState({ cursorPosition: clientX - elX });
  }

  handleMouseLeave = (e) => {
    if (e.currentTarget !== this.controlsEl.current) return;
    this.setState({ shouldShowCursor: false });
  }

  setTime = (e) => {
    const { shouldShowCursor, cursorPosition } = this.state;
    if (!shouldShowCursor || this.controlsEl.current == null) return;
    const { width } = this.controlsEl.current.getBoundingClientRect();
    const p = cursorPosition / width;
    this.props.setCurrentTime(p);
  }

  togglePlay = (e) => {
    e.stopPropagation();
    this.props.togglePlay();
  }

  render() {
    const { completion, status } = this.props;
    const { cursorPosition, shouldShowCursor } = this.state;
    const playheadStyle = {
      transform: `translateX(${completion * 100}%)`
    };
    const cursorStyle = {
      transform: `translateX(${cursorPosition}px)`
    };
    const playClass = `controls__play ${status === PlayStatus.PLAYING ? 'controls__play--playing' : 'controls__play--paused'}`;

    return (
      <div
        className="controls"
        onMouseOver={this.handleMouseOver}
        onMouseLeave={this.handleMouseLeave}
        onMouseMove={this.handleMouseMove}
        onClick={this.setTime}
        ref={this.controlsEl}
      >
        <div className='controls__playhead' style={playheadStyle} />
        { shouldShowCursor && <div className='controls__cursor' style={cursorStyle} onClick={this.setTime} /> }
        <div className={playClass} onClick={this.togglePlay} />
      </div>
    );
  }
}