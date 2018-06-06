import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import range from 'lodash/range'
import { Waveform } from './styled'
import Analyzer from './Analyzer'
import Bars from './visualizers/Bars'
import { Play } from './icons'
import Ticker from 'ticker'
import { powerOf2 } from './PropTypes'

const Screen = Waveform.withComponent('div').extend`
  position: relative;
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
      bars: range(0, bins).map(b => 0),
      ready: false,
      cursor: 0,
      shouldShowCursor: false,
      playing: false,
      ended: false,
      playingProgress: 0
    }
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
      this.audioContext.decodeAudioData(fileReader.result, this.calculateWaveform)
    })
    fileReader.readAsArrayBuffer(blob)
  }

  //   handleMouseMove = (e) => {
  //     // if (this.svg == null) return
  //     // const {bars} = this.props
  //     // const {width} = this.svg.getBoundingClientRect()
  //     // const pos = Math.floor((bars / width) * e.nativeEvent.offsetX)
  //     // this.setState({cursor: pos})
  //   }
  //
  //   handleMouseOver = (e) => {
  //     // this.setState({shouldShowCursor: true})
  //   }
  //
  //   handleMouseOut = (e) => {
  //     // this.setState({shouldShowCursor: false})
  //   }

  handlePressPlay = (e) => {
    const {playing} = this.state
    if (playing) {
      console.log('pausing')
      return this.setState({playing: false}, () => {
        Ticker.pause()
        this.audio.pause()
      })
    }
    return this.setState({playing: true}, () => {
      if (this.state.ended) {
        console.log('restarting')
        this.setState({playingProgress: 0, ended: false})
        Ticker.push(this)
      } else {
        console.log('playing')
      }
      Ticker.start()
      this.audio.play()
    })
  }

  handleEnded = (e) => {
    Ticker.clear(this)
    this.setState({playing: false, ended: true, playingProgress: 0})
  }

  update = (e) => {
    if (!this.state.playing) return
    if (e / 1000 > this.duration) this.handleEnded()
    const {bins} = this.props
    const p = e / (1000 * this.duration)
    const f = Math.round(bins * p)
    this.setState({playingProgress: p})
  }

  draw = () => {

  }

  calculateWaveform = (buffer) => {
    const {bins} = this.props
    const channels = range(0, buffer.numberOfChannels - 1)
      .map(c => buffer.getChannelData(c))
    const channelLength = channels[0].length
    const windowLength = Math.floor(channelLength / bins)
    const averages = []
    const base = Math.floor(channelLength / bins)
    let i = 0
    let sum = 0
    let rms = 0

    while (i < channelLength) {
      if (i % base === 0) {
        rms = Math.sqrt(sum / (windowLength * channels.length))
        averages.push(rms)
        sum = 0
      }

      sum += channels.reduce((m, c) => {
        m += Math.pow(c[i], 2)
        return m
      }, 0)

      i++
    }
    this.setState({bars: averages, ready: true}, this.renderWaveform)
  }

  renderWaveform = () => {
    if (this.canvas == null || this.screen == null) return
    const {bars} = this.state
    const barHeightScalar = 1000
    const barWidth = 10
    const vCenter = 500

    this.canvas.fillStyle = 'white'
    let barY, barHeight

    for (let i = 0; i < bars.length; i++) {
      barHeight = bars[i] * barHeightScalar
      barY = vCenter - (barHeight / 2)
      this.canvas.fillRect(i * barWidth, barY, barWidth, barHeight)
    }
  }

  render () {
    const {audio, audioContext, source} = this
    const {bins, visualizer} = this.props
    const {bars, ready, cursor, shouldShowCursor, playingProgress, playing, ended} = this.state
    const className = ready ? 'waveform--bar ready' : 'waveform--bar'
    const playheadX = Math.round(bins * playingProgress)

    return (
      <Screen innerRef={el => { this.screen = el }}>
        {
          ready && source
            ? <Analyzer
              bins={bins}
              audio={audio}
              audioContext={audioContext}
              source={source}
              visualizer={visualizer}
              progress={playingProgress}
              playing={playing}
              ended={ended}
              waveform={bars}
            />
            : null
        }
        <Waveform
          innerRef={el => { this.canvas = el && el.getContext('2d') }}
          onMouseMove={this.handleMouseMove}
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
          width={bars.length * 10}
          height={1000}
        />

        <div className='controls'>
          <Play className='controls--play' onClick={this.handlePressPlay} />
        </div>
      </Screen>
    )
  }
}

AudioPlay.propTypes = {
  src: PropTypes.string.isRequired,
  bins: powerOf2.isRequired,
  visualizer: PropTypes.func
}

AudioPlay.defaultProps = {
  bins: 256,
  visualizer: Bars
}

export default AudioPlay
