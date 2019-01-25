import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { calculateRMSWaveform } from '../utils';
import { TWOPI } from '../constants/math';
import { INNER_TO_OUTER_RATIO } from '../constants/Circles';

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 1000;

export default class Waveform extends Component {
  static propTypes = {
    buffer: PropTypes.instanceOf(AudioBuffer).isRequired,
    bins: PropTypes.number.isRequired,
  };

  state = {
    cursor: 0,
    shouldShowCursor: false,
    bars: []
  };

  constructor(props) {
    super(props);
    this.svg = React.createRef();
    this.width = VIEWBOX_WIDTH;
    this.height = VIEWBOX_HEIGHT;
  }

  componentDidMount() {
    this.renderWaveform();
  }

  renderWaveform = () => {
    const { width, height } = this;
    const { bins, buffer } = this.props;
    const frames = calculateRMSWaveform(buffer, bins);
    const barHeightScalar = height * 0.7 * INNER_TO_OUTER_RATIO;
    const bars = [];
    const length = frames.length;
    const r1 = Math.min(width, height) / 2;
    const innerR1 = r1 * INNER_TO_OUTER_RATIO;
    let barHeight;
    let angle;
    let r2;
    let c;
    let s;

    for (let i = 0; i < length; i++) {
      angle = i / length * TWOPI;
      barHeight = frames[i] * barHeightScalar;
      r2 = innerR1 - barHeight;
      c = Math.cos(angle);
      s = -Math.sin(angle);
      bars.push({
        x1: innerR1 * c + r1,
        y1: innerR1 * s + r1,
        x2: r2 * c + r1,
        y2: r2 * s + r1,
      });
    }
    this.setState({ bars });
  };

  render() {
    const { width, height } = this;
    const { bars } = this.state;
    const r = Math.min(width, height) / 2;
    const innerR = r * INNER_TO_OUTER_RATIO;
    const barWidth = (TWOPI * r / bars.length) / 4;

    return (
      <svg
        className='waveform'
        ref={this.svg}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        onMouseMove={this.handleMouseMove}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
      >
        <defs>
          <linearGradient id='waveform__bg' className='waveform__bg' x1='0' y1='0' x2='1' y2='1'>
            <stop className='waveform__bg__stop1' offset='0%' />
            <stop className='waveform__bg__stop2' offset='100%' />
          </linearGradient>
        </defs>
        
        <circle cx={r} cy={r} r={innerR} fill='url(#waveform__bg)' />
        
        {
          bars.map(({ x1, y1, x2, y2 }, i) => (
            <line className='waveform__bar' key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={barWidth} />
          ))
        }
      </svg>
    );
  }
}
