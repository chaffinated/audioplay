import React, { Component } from 'react'
import { render } from 'react-dom'
import styled from 'styled-components'
import AudioPlay from './AudioPlay'
// import src from './audio/loop.wav'
import src from './audio/lavender.mp3'
import Bars from './visualizers/Bars'
import Circles from './visualizers/Circles'

const Wrap = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`

class App extends Component {
  render () {
    return (
      <Wrap>
        <AudioPlay src={src} visualizer={Bars} />
      </Wrap>
    )
  }
}

function init () {
  const root = document.getElementById('app')
  render(<App />, root)
}

document.addEventListener('DOMContentLoaded', init)
