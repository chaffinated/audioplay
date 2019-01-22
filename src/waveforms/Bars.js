import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { calculateRMSWaveform } from '../utils';

const SVG = styled.svg`
  position: absolute;
  width: 100%;
  height: 100%;
  max-width: 800px;
  max-height: 600px;
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
    const barHeightScalar = height;
    const barWidth = width / bins;
    const vCenter = height / 2;
    const bars = [];
    let barY;
    let barHeight;

    for (let i = 0; i < frames.length; i++) {
      barHeight = frames[i] * barHeightScalar;
      barY = vCenter - barHeight / 2;
      bars.push({
        x: i * barWidth,
        y: barY,
        width: barWidth,
        height: barHeight
      });
    }
    this.setState({ bars });
  };

  render() {
    const { width, height } = this.props;
    const { bars } = this.state;

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
          bars.map(({ x, y, width, height }, i) => (
            <rect key={i} x={x} y={y} width={width} height={height} />
          ))
        }
      </SVG>
    );
  }
}
