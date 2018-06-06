import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { powerOf2 } from './PropTypes'
import Ticker from 'ticker'

const AudioContext = window.AudioContext || window.webkitAudioContext

export default class Analyzer extends Component {
  constructor (props) {
    super(props)
    const { bins } = this.props

    this.state = {
      fft: new Float32Array(bins),
      timeDomain: new Float32Array(bins)
    }
  }

	static propTypes = {
	  bins: powerOf2.isRequired,
	  visualizer: PropTypes.func.isRequired,
	  playing: PropTypes.bool.isRequired,
	  ended: PropTypes.bool.isRequired,
	  // progress: PropTypes.number.isRequired,
	  waveform: PropTypes.arrayOf(PropTypes.number).isRequired,
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
	  this.setState({fft})
	}

	draw (t) {

	}

	render () {
	  const {bins, waveform} = this.props
	  const {timeDomain, fft} = this.state
	  return <this.props.visualizer
	    bins={bins}
	    waveform={waveform}
	    timeDomain={timeDomain}
	    fft={fft}
  	/>
	}
}
