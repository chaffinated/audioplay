import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Analyzer from './Analyzer';
import { Bars as Waveform } from './waveforms';
import { Bars as Visualizer } from './visualizers';
import { Controls } from './controls';
import { powerOf2, Ticker } from './utils';

Ticker.autostart = false;
Ticker.pauseInBackground = false;

const AudioContext = window.AudioContext || window.webkitAudioContext;

class AudioPlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      playing: false,
      ended: false,
      playingProgress: 0,
      buffer: null
    };
    this._audioContextSuspended = true;
  }

  static propTypes = {
    src: PropTypes.string.isRequired,
    bins: powerOf2.isRequired,
    visualizer: PropTypes.func,
    height: PropTypes.number,
    width: PropTypes.number,
    waveform: PropTypes.func,
    controls: PropTypes.func,
  };

  static defaultProps = {
    bins: 256,
    visualizer: Visualizer,
    height: 600,
    width: 800,
    waveform: Waveform,
    controls: Controls,
  };

  componentDidMount() {
    const { src } = this.props;

    fetch(src)
      .then(res => res.blob())
      .then(this.decodeAudio);

    this.audio = new Audio(src);
    this.audioContext = new AudioContext();
    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.source.connect(this.audioContext.destination);

    this.audio.addEventListener('loadedmetadata', this.handleMetaData);
    this.audio.addEventListener('ended', this.handleEnded);
    Ticker.push(this, false);
  }

  handleMetaData = () => {
    this.duration = this.audio.duration;
  };

  decodeAudio = blob => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      this.audioContext.decodeAudioData(fileReader.result, d => {
        this.setState({ ready: true, buffer: d });
      });
    });
    fileReader.readAsArrayBuffer(blob);
  };

  handlePressPlay = e => {
    if (this._audioContextSuspended) {
      this._audioContextSuspended = false;
      this.audioContext.resume().then(this.togglePlay);
    } else {
      this.togglePlay();
    }
  };

  togglePlay = () => {
    const { playing } = this.state;
    if (playing) {
      console.log('pausing');
      return this.setState({ playing: false }, () => {
        Ticker.pause();
        this.audio.pause();
      });
    }
    return this.setState({ playing: true }, this.updatePlayState);
  };

  handleEnded = e => {
    Ticker.clear(this);
    this.setState({ playing: false, ended: true, playingProgress: 0 });
  };

  updatePlayState = () => {
    if (this.state.ended) {
      console.log('restarting');
      this.setState({ playingProgress: 0, ended: false });
      Ticker.push(this);
    } else {
      console.log('playing');
    }
    Ticker.start();
    this.audio.play();
  };

  update = e => {
    if (!this.state.playing) return;
    if (e / 1000 > this.duration) this.handleEnded();
    const p = e / (1000 * this.duration);
    this.playingProgress = p;
  };

  draw = () => {
    if (this.state.playingProgress === this.playingProgress) return;
    this.setState({ playingProgress: this.playingProgress });
  };

  render() {
    const { audio, audioContext, source } = this;
    const { bins, visualizer, height, width } = this.props;
    const { ready, playingProgress, playing, ended, buffer } = this.state;

    return (
      <div className="screen" ref={el => { this.screen = el; }}>
        {
          ready && source && buffer
          ? (
            <Analyzer
              bins={bins}
              width={width}
              height={height}
              buffer={buffer}
              audio={audio}
              audioContext={audioContext}
              source={source}
              visualizer={visualizer}
              playing={playing}
              ended={ended}
            />
          )
          : null
        }
        
        {
          ready && buffer
            ? (
              <this.props.waveform
                height={height}
                width={width}
                bins={bins}
                buffer={buffer}
              />
            )
            : null
        }

        <this.props.controls togglePlay={this.handlePressPlay} completion={playingProgress} />
      </div>
    );
  }
}

export default AudioPlay;
