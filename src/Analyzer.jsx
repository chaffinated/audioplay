import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { powerOf2, Ticker, playStatus } from './utils';
import PlayStatus from './constants/PlayStatus';

const AudioContext = window.AudioContext || window.webkitAudioContext;

export default class Analyzer extends Component {
  constructor(props) {
    super(props);
    const { bins } = this.props;

    this.state = {
      fft: new Float32Array(bins),
      timeDomain: new Float32Array(bins)
    };
  }

  static propTypes = {
    bins: powerOf2.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    buffer: PropTypes.instanceOf(AudioBuffer).isRequired,
    visualizer: PropTypes.func.isRequired,
    status: playStatus.isRequired,
    // progress: PropTypes.number.isRequired,
    audioContext: PropTypes.instanceOf(AudioContext),
    audio: PropTypes.instanceOf(Audio)
  };

  get animationPaused() {
    return this.props.status !== PlayStatus.PLAYING;
  }

  componentDidMount() {
    const { audioContext, source, bins } = this.props;
    this.analyzer = audioContext.createAnalyser();
    this.analyzer.fftSize = bins * 2;
    this.analyzer.smoothingTimeConstant = 0.7;
    source.connect(this.analyzer);
    Ticker.push(this, false);
  }

  update(t) {
    const { status } = this.props;
    if (status !== PlayStatus.PLAYING) return;
    const { fft, timeDomain } = this.state;
    this.analyzer.getFloatFrequencyData(fft);
    this.analyzer.getFloatTimeDomainData &&
      this.analyzer.getFloatTimeDomainData(timeDomain);
  }

  draw(t) {
    // NOTE: This isn't exactly intuitive, but we must
    // trigger an update...
    const { fft, timeDomain } = this.state;
    this.setState({ fft, timeDomain });
  }

  render() {
    const { analyzer } = this;
    const { bins, buffer, height, width, status } = this.props;
    const { timeDomain, fft } = this.state;
    return (
      <this.props.visualizer
        bins={bins}
        buffer={buffer}
        height={height}
        width={width}
        timeDomain={timeDomain}
        fft={fft}
        status={status}
        analyzer={analyzer}
      />
    );
  }
}
