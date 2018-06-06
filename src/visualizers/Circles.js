import React, { Component } from 'react'
import PropTypes from 'prop-types'
// import styled from 'styled-components'
import range from 'lodash/range'
import { float32Array } from '../PropTypes'
import { Waveform } from '../styled'

const BANDWIDTH = 20000 - 20
const MAX_HARMONIC = 3000 / BANDWIDTH
const PITCH_DICT = range(0, 11).map(i => Math.pow(2, i / 12))

const Viz = Waveform.extend`
  z-index: 10;
  mix-blend-mode: multiply;
`

export default class Visualizer extends Component {
  constructor (props) {
    super(props)
    this.bins = props.waveform.length
  }

  shouldComponentUpdate () {
    this.draw()
    return false
  }

  update = () => {

  }

  draw = () => {
    if (this.canvas == null) return
    const {spectrum} = this.props
    const binWidth = 10
    const vCenter = 500
    const widthHeightRatio = this.canvas.width / this.canvas.height

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.width)
    let circleY, circleR, intensity

    for (let i = 0; i < this.bins; i++) {
      intensity = (spectrum[i] + 280) / 280
      circleR = intensity * vCenter / 2
      this.ctx.strokeStyle = `rgb(${Math.floor(intensity * 255)}, ${Math.floor(intensity * 180)}, ${Math.floor(1 / intensity * 128)})`
      this.ctx.beginPath()
      this.ctx.ellipse(i * binWidth, vCenter, circleR * widthHeightRatio, circleR, 0, 0, 2 * Math.PI)
      this.ctx.stroke()
      this.ctx.closePath()
    }
  }

  // componentWillUpdate () {
  //   this.draw()
  // }

  render () {
    const {waveform, progress, spectrum} = this.props
    // const corr = this.pitchDict.map(pitch => {
    //   return pitch.reduce((m, f) => {
    //     m += spectrum[Math.round(f)] || 0
    //     return m
    //   }, 0)
    // })
    if (waveform == null || spectrum == null) return null

    return (
      <Viz
        innerRef={el => {
          if (el == null) return
          this.canvas = el
          this.ctx = el && el.getContext('2d')
        }}
        width={this.bins * 10}
        height={1000}
      />
    )
  }
}

Visualizer.propTypes = {
  waveform: PropTypes.arrayOf(Number).isRequired,
  spectrum: float32Array,
  progress: PropTypes.number.isRequired
}
