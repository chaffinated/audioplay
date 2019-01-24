import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { calculateRMSWaveform } from '../utils';
import { TWOPI } from '../constants/math';
import { INNER_TO_OUTER_RATIO } from '../constants/Circles';

const VIS_WIDTH = 1600;
const VIS_HEIGHT = 1600;

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
    const { bins, buffer, fft } = this.props;
    const radius = height / 2;
    this.waveform = calculateRMSWaveform(buffer, bins);
    this.points = [];
    let angle;
    for (let i = 0; i < fft.length; i++) {
      angle = i / fft.length * TWOPI;
      this.points.push([
        Math.cos(angle) * (radius * INNER_TO_OUTER_RATIO) + radius,
        Math.sin(angle) * (radius * INNER_TO_OUTER_RATIO) + radius,
      ]);
    }
  }

  draw = () => {
    if (this.canvas == null) return;
    const { width, height, points } = this;
    const { fft, bins } = this.props;
    const barHeightScalar = height / 8;
    const barWidth = width / bins / 2;
    const radius = height / 2;

    this.ctx.clearRect(0, 0, width, height);
    this.ctx.lineWidth = barWidth;

    let barR;
    let intensity;
    let angle;

    for (let i = 0; i < fft.length; i++) {
      angle = i / fft.length * TWOPI;
      intensity = (fft[i] + 180) / 180;
      // this.ctx.strokeStyle = `rgb(
      //   ${Math.floor(intensity * 255 + 10)},
      //   ${Math.floor(intensity * 180 + 20)},
      //   ${Math.floor((1 / intensity) * 100)})
      // `;
      this.ctx.strokeStyle = `rgba(25,5,30,${1 / (intensity + 1) - intensity / 3})`;
      this.ctx.beginPath();
      barR = intensity * barHeightScalar + (radius * INNER_TO_OUTER_RATIO);
      this.ctx.moveTo(...points[i]);
      this.ctx.lineTo(
        Math.cos(angle) * barR + radius,
        Math.sin(angle) * barR + radius,
      );
      this.ctx.stroke();
    }

  };

  componentWillUpdate() {
    this.draw();
  }

  render() {
    const { waveform, width, height, points } = this;
    const { fft, bins } = this.props;
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
