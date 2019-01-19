import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Analyzer from './Analyzer'
import { Bars as Waveform } from './waveforms'
import { Bars as Visualizer } from './visualizers'
import { Play } from './icons'
import { powerOf2, Ticker } from './utils'

const Screen = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  max-width: 800px;
  max-height: 600px;
  background-color: #D3E3E0;
`

Ticker.autostart = false
Ticker.pauseInBackground = false

const AudioContext = window.AudioContext || window.webkitAudioContext

class AudioPlay extends Component {
  constructor (props) {
    super(props)
    const {bins} = props
    this.state = {
      ready: false,
      playing: false,
      ended: false,
      playingProgress: 0,
      buffer: null
    }
    this._audioContextSuspended = true;
  }

  static propTypes = {
    src: PropTypes.string.isRequired,
    bins: powerOf2.isRequired,
    visualizer: PropTypes.func,
    height: PropTypes.number,
    width: PropTypes.number,
    waveform: PropTypes.func
  }

  static defaultProps = {
    bins: 256,
    visualizer: Visualizer,
    height: 600,
    width: 800,
    waveform: Waveform
  }

  componentDidMount () {
    const {src, bins} = this.props

    fetch(src)
      .then(res => res.blob())
      .then(this.decodeAudio)

    this.audio = new Audio(src)
    this.audioContext = new AudioContext()
    this.source = this.audioContext.createMediaElementSource(this.audio)
    this.source.connect(this.audioContext.destination)

    this.audio.addEventListener('loadedmetadata', this.handleMetaData)
    this.audio.addEventListener('ended', this.handleEnded)
    Ticker.push(this, false)
  }

  handleMetaData = (d) => {
    this.duration = this.audio.duration
  }

  decodeAudio = (blob) => {
    const fileReader = new FileReader()
    fileReader.addEventListener('load', () => {
      this.audioContext.decodeAudioData(fileReader.result, (d) => {
        this.setState({ready: true, buffer: d})
      })
    })
    fileReader.readAsArrayBuffer(blob)
  }

  handlePressPlay = (e) => {
    if (this._audioContextSuspended) {
      this._audioContextSuspended = false;
      this.audioContext.resume().then(this.togglePlay);
    } else {
      this.togglePlay();
    }
  }

  togglePlay = () => {
    const {playing} = this.state
    if (playing) {
      console.log('pausing')
      return this.setState({playing: false}, () => {
        Ticker.pause()
        this.audio.pause()
      })
    }
    return this.setState({playing: true}, this.updatePlayState);
  }

  handleEnded = (e) => {
    Ticker.clear(this)
    this.setState({playing: false, ended: true, playingProgress: 0})
  }

  updatePlayState = () => {
    if (this.state.ended) {
      console.log('restarting')
      this.setState({playingProgress: 0, ended: false})
      Ticker.push(this)
    } else {
      console.log('playing')
    }
    Ticker.start()
    this.audio.play()
  }

  update = (e) => {
    if (!this.state.playing) return
    if (e / 1000 > this.duration) this.handleEnded()
    const {bins} = this.props
    const p = e / (1000 * this.duration)
    const f = Math.round(bins * p)
    this.playingProgress = p
  }

  draw = () => {
    if (this.state.playingProgress === this.playingProgress) return
    this.setState({playingProgress: this.playingProgress})
  }

  render () {
    const {audio, audioContext, source} = this
    const {bins, visualizer, height, width} = this.props
    const {ready, playingProgress, playing, ended, buffer} = this.state
    const playheadX = Math.round(bins * playingProgress)

    return (
      <Screen innerRef={el => { this.screen = el }}>
        {
          ready && source && buffer
            ? <Analyzer
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
            : null
        }
        {
          ready && buffer
            ? <this.props.waveform height={height} width={width} bins={bins} buffer={buffer} />
            : null
        }

        <div className='controls'>
          <Play className='controls--play' onClick={this.handlePressPlay} />
        </div>
      </Screen>
    )
  }
}

export default AudioPlay
