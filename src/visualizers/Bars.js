import React, { Component } from 'react'
import PropTypes from 'prop-types'
// import styled from 'styled-components'
import range from 'lodash/range'
import { float32Array } from '../PropTypes'
import { Waveform } from '../styled'

const Viz = Waveform.extend`
  z-index: 10;
  mix-blend-mode: multiply;
`

export default class Visualizer extends Component {
  static propTypes = {
    waveform: PropTypes.arrayOf(Number).isRequired,
    fft: PropTypes.instanceOf(Float32Array).isRequired
    // progress: PropTypes.number.isRequired
  }

  draw = () => {
    if (this.canvas == null) return
    const {waveform, fft} = this.props
    const barHeightScalar = 1000
    const barWidth = 10
    const vCenter = 500

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.width)
    // this.ctx.fillStyle = 'blue'
    let barY, barHeight, intensity

    for (let i = 0; i < waveform.length; i++) {
      intensity = (fft[i] + 280) / 280
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
    const {waveform, fft} = this.props
    if (waveform == null || fft == null) return null

    return (
      <Viz
        innerRef={el => {
          if (el == null) return
          this.canvas = el
          this.ctx = el && el.getContext('2d')
        }}
        width={waveform.length * 10}
        height={1000}
      />
    )
  }
}
