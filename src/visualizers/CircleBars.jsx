import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import aWeight from 'a-weighting/a';
import { calculateRMSWaveform } from '../utils';
import { TWOPI } from '../constants/math';
import { INNER_TO_OUTER_RATIO } from '../constants/Circles';

const VIS_WIDTH = 1600;
const VIS_HEIGHT = 1600;
// const FREQS = 22050;

export default class Visualizer extends Component {
  constructor(props) {
    super(props);
    this.waveform = [];
    this.width = VIS_WIDTH;
    this.height = VIS_HEIGHT;
  }

  static propTypes = {
    fft: PropTypes.instanceOf(Float32Array).isRequired,
    timeDomain: PropTypes.instanceOf(Float32Array).isRequired,
    bins: PropTypes.number.isRequired,
    buffer: PropTypes.instanceOf(AudioBuffer).isRequired,
    // progress: PropTypes.number.isRequired
  };

  componentDidMount() {
    const { height } = this;
    const { bins, buffer, fft, timeDomain } = this.props;
    const radius = height / 2;
    this.waveform = calculateRMSWaveform(buffer, bins);
    this.points = [];
    let angle;
    for (let i = 0; i < fft.length; i++) {
      angle = i / fft.length * TWOPI;
      this.points.push([
        Math.cos(angle) * (radius * INNER_TO_OUTER_RATIO) + radius,
        Math.sin(-angle) * (radius * INNER_TO_OUTER_RATIO) + radius,
      ]);
    }
  }

  draw = () => {
    if (this.canvas == null) return;
    const { width, height, points } = this;
    const { fft, bins, analyzer, timeDomain } = this.props;
    const barHeightScalar = height / 6;
    const barWidth = width / bins / 2;
    const radius = height / 2;
    const innerRadius = radius * INNER_TO_OUTER_RATIO;
    const dbRange = analyzer.maxDecibels - analyzer.minDecibels;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.lineWidth = barWidth;

    let barR;
    let intensity;
    let angle;
    // let weight;
    let f;

    for (let i = 0; i < fft.length; i++) {
      f = i / fft.length;
      angle = f * TWOPI;
      // weight = aWeight(FREQS * f + 20);
      intensity = (fft[i] - analyzer.minDecibels) / dbRange;
      this.ctx.strokeStyle = `rgb(
        ${Math.floor(intensity * 220)},
        ${Math.floor(intensity * 250)},
        ${Math.floor(intensity * 90 + 165)})
      `;
      // this.ctx.strokeStyle = `rgba(25,5,30,${1 / (intensity + 1) - intensity * 0.8})`;
      this.ctx.beginPath();
      barR = intensity * barHeightScalar + innerRadius;
      this.ctx.moveTo(...points[i]);
      this.ctx.lineTo(
        Math.cos(angle) * barR + radius,
        Math.sin(-angle) * barR + radius,
      );
      this.ctx.stroke();
    }

  };

  componentWillUpdate() {
    this.draw();
  }

  render() {
    const { waveform, width, height, points } = this;
    const { fft } = this.props;
    if (waveform == null || fft == null || points == null) return null;

    return (
      <canvas
        className='visualizer'
        ref={el => {
          if (el == null) return;
          this.canvas = el;
          this.ctx = el && el.getContext('2d');
        }}
        width={width}
        height={height}
      />
    );
  }
}
