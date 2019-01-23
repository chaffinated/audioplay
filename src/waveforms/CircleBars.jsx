import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { calculateRMSWaveform } from '../utils';
import { TWOPI } from '../constants/math';

const SVG = styled.svg`
  position: absolute;
  width: 100%;
  height: 100%;
  max-width: 800px;
  max-height: 800px;
  min-height: 400px;
`;

export default class Waveform extends Component {
  static propTypes = {
    buffer: PropTypes.instanceOf(AudioBuffer).isRequired,
    bins: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
  };

  state = {
    cursor: 0,
    shouldShowCursor: false,
    bars: []
  };

  componentDidMount() {
    this.renderWaveform();
  }

  renderWaveform = () => {
    const { bins, buffer, height, width } = this.props;
    const frames = calculateRMSWaveform(buffer, bins);
    const barHeightScalar = height / 2;
    const bars = [];
    const length = frames.length;
    const r1 = Math.min(width, height) / 2;
    let barHeight;
    let angle;
    let r2;
    let c;
    let s;

    for (let i = 0; i < length; i++) {
      angle = i / length * TWOPI;
      barHeight = frames[i] * barHeightScalar;
      r2 = r1 - barHeight;
      c = Math.cos(angle);
      s = Math.sin(angle);
      bars.push({
        x1: r1 * c + r1,
        y1: r1 * s + r1,
        x2: r2 * c + r1,
        y2: r2 * s + r1,
      });
    }
    this.setState({ bars });
  };

  render() {
    const { width, height } = this.props;
    const { bars } = this.state;
    const r = Math.min(width, height) / 2;
    const barWidth = (TWOPI * r / bars.length) - 3;

    return (
      <SVG
        innerRef={el => { this.svg = el; }}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        onMouseMove={this.handleMouseMove}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
      >
        {
          bars.map(({ x1, y1, x2, y2 }, i) => (
            <line className='waveform__bar' key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={barWidth} />
          ))
        }
      </SVG>
    );
  }
}
