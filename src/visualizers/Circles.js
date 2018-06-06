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
    fft: PropTypes.instanceOf(Float32Array).isRequired,
    progress: PropTypes.number.isRequired
  }

  componentWillUpdate () {
    this.draw()
  }

  update = () => {

  }

  draw = () => {
    if (this.canvas == null) return
    const {fft, bins} = this.props
    const binWidth = 10
    const vCenter = 500
    const widthHeightRatio = this.canvas.width / this.canvas.height

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.width)
    let circleY, circleR, intensity

    for (let i = 0; i < bins; i++) {
      intensity = (fft[i] + 280) / 280
      circleR = intensity * vCenter / 2
      this.ctx.strokeStyle = `rgb(${Math.floor(intensity * 255)}, ${Math.floor(intensity * 180)}, ${Math.floor(1 / intensity * 128)})`
      this.ctx.beginPath()
      this.ctx.ellipse(i * binWidth, vCenter, circleR * widthHeightRatio, circleR, 0, 0, 2 * Math.PI)
      this.ctx.stroke()
      this.ctx.closePath()
    }
  }

  render () {
    const {waveform, progress, fft, bins} = this.props
    if (waveform == null || fft == null) return null

    return (
      <Viz
        innerRef={el => {
          if (el == null) return
          this.canvas = el
          this.ctx = el && el.getContext('2d')
        }}
        width={bins * 10}
        height={1000}
      />
    )
  }
}
