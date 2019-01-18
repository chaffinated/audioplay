import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import range from 'lodash/range'
import { calculateRMSWaveform, powerOf2 } from '../utils'

const Viz = styled.canvas`
  position: absolute;
  width: 100%;
  height: 100%;
  max-width: 800px;
  max-height: 600px;
  min-height: 400px;
  z-index: 10;
  mix-blend-mode: multiply;
  pointer-events: none;
`

export default class Visualizer extends Component {
  constructor (props) {
    super(props)
    this.waveform = []
  }

  static propTypes = {
    fft: PropTypes.instanceOf(Float32Array).isRequired,
    timeDomain: PropTypes.instanceOf(Float32Array).isRequired,
    bins: PropTypes.number.isRequired,
    buffer: PropTypes.instanceOf(AudioBuffer).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
    // progress: PropTypes.number.isRequired
  }

  componentDidMount () {
    const {bins, buffer} = this.props
    this.waveform = calculateRMSWaveform(buffer, bins)
  }

  draw = () => {
    if (this.canvas == null) return
    const {waveform} = this
    const {fft, timeDomain, width, height, bins} = this.props
    const barHeightScalar = height
    const barWidth = width / bins
    const vCenter = height / 2

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.width)
    let barY, barHeight, intensity

    for (let i = 0; i < fft.length; i++) {
      intensity = (fft[i] + vCenter) / vCenter
      this.ctx.fillStyle = `rgb(${Math.floor(intensity * 255)}, ${Math.floor(intensity * 180)}, ${Math.floor(1 / intensity * 128)})`
      barHeight = waveform[i] * intensity * barHeightScalar * 2
      barY = vCenter - (barHeight / 2)
      this.ctx.fillRect(i * barWidth, barY, barWidth, barHeight)
    }
  }

  componentWillUpdate () {
    this.draw()
  }

  render () {
    const {waveform} = this
    const {fft, bins, height, width} = this.props
    if (waveform == null || fft == null) return null

    return (
      <Viz
        innerRef={el => {
          if (el == null) return
          this.canvas = el
          this.ctx = el && el.getContext('2d')
        }}
        width={width}
        height={height}
      />
    )
  }
}
