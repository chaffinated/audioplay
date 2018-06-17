import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { powerOf2, Ticker } from './utils'

const AudioContext = window.AudioContext || window.webkitAudioContext

export default class Analyzer extends Component {
  constructor (props) {
    super(props)
    const {bins} = this.props

    this.state = {
      fft: new Float32Array(bins),
      timeDomain: new Float32Array(bins)
    }
  }

  static propTypes = {
    bins: powerOf2.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    buffer: PropTypes.instanceOf(AudioBuffer).isRequired,
    visualizer: PropTypes.func.isRequired,
    playing: PropTypes.bool.isRequired,
    ended: PropTypes.bool.isRequired,
    // progress: PropTypes.number.isRequired,
    audioContext: PropTypes.instanceOf(AudioContext),
    audio: PropTypes.instanceOf(Audio)
  }

  componentDidMount () {
    const {audioContext, source, bins} = this.props
    this.analyzer = audioContext.createAnalyser()
    this.analyzer.fftSize = bins * 2
    source.connect(this.analyzer)
    Ticker.push(this, false)
  }

  update (t) {
    const {playing, ended} = this.props
    if (!playing || ended) return
    const {fft} = this.state
    this.analyzer.getFloatFrequencyData(fft)
  }

  draw (t) {
    // NOTE: This isn't exactly intuitive, but we must
    // trigger an update...
    const {fft} = this.state
    this.setState({fft})
  }

  render () {
    const {bins, buffer, height, width} = this.props
    const {timeDomain, fft} = this.state
    return <this.props.visualizer
      bins={bins}
      buffer={buffer}
      height={height}
      width={width}
      timeDomain={timeDomain}
      fft={fft}
    />
  }
}
