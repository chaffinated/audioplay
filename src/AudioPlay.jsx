import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Analyzer from './Analyzer';
import PlayStatus from './constants/PlayStatus';
import { CircleBars as Waveform } from './waveforms';
import { CircleBars as Visualizer } from './visualizers';
import { CircleControls as Controls } from './controls';
import { powerOf2, Ticker } from './utils';

Ticker.autostart = false;
Ticker.pauseInBackground = false;

const AudioContext = window.AudioContext || window.webkitAudioContext;

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 800;

class AudioPlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      status: PlayStatus.UNSTARTED,
      playingProgress: 0,
      buffer: null,
    };
    this._audioContextSuspended = true;
    this.screenEl = React.createRef();
  }

  static propTypes = {
    src: PropTypes.string.isRequired,
    bins: powerOf2.isRequired,
    visualizer: PropTypes.func,
    waveform: PropTypes.func,
    controls: PropTypes.func,
  };

  static defaultProps = {
    bins: 256,
    visualizer: Visualizer,
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
    // get track meta data and do something here maybe
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
    const { status } = this.state;
    if (status === PlayStatus.PLAYING) {
      return this.setState({ status: PlayStatus.PAUSED }, () => {
        this.audio.pause();
      });
    } else if (status === PlayStatus.ENDED) {
      return this.setState({ status: PlayStatus.ENDED }, this.updatePlayState);
    }
    return this.setState({ status: PlayStatus.PLAYING }, this.updatePlayState);
  };

  handleEnded = e => {
    Ticker.clear(this);
    this.setState({ status: PlayStatus.ENDED, playingProgress: 0 });
  };

  updatePlayState = () => {
    const { status } = this.state;
    if (status === PlayStatus.ENDED) {
      this.setState({ playingProgress: 0, status: PlayStatus.PLAYING });
      Ticker.push(this);
    }
    Ticker.start();
    this.audio.play();
  };

  setCurrentTime = (p) => {
    this.audio.currentTime = p * this.audio.duration;
    this.setState({ playingProgress: p });
  }

  update = () => {
    const { audio } = this;
    const { status } = this.state;
    if (status !== PlayStatus.PLAYING || audio == null) return;
    const p = audio.currentTime / audio.duration;
    if (p > 1) this.handleEnded();
    this.playingProgress = p;
  };

  draw = () => {
    if (this.state.playingProgress === this.playingProgress) return;
    this.setState({ playingProgress: this.playingProgress });
  };

  get animationPaused() {
    return this.state.status === PlayStatus.PAUSED;
  }

  render() {
    const { audio, audioContext, source, screenEl } = this;
    const { bins, visualizer } = this.props;
    const { ready, playingProgress, buffer, status } = this.state;
    const { width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = screenEl.current && screenEl.current.getBoundingClientRect() || {};

    return (
      <div className="screen" ref={screenEl}>
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
              status={status}
            />
          )
          : null
        }

        {
          ready && buffer
            ? <this.props.waveform bins={bins} buffer={buffer} />
            : null
        }

        <this.props.controls
          togglePlay={this.handlePressPlay}
          setCurrentTime={this.setCurrentTime}
          completion={playingProgress}
          status={status}
          width={width}
          height={height}
        />
      </div>
    );
  }
}

export default AudioPlay;
