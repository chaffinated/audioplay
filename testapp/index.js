import React, { Component } from 'react'
import { render } from 'react-dom'
import styled from 'styled-components'
import AudioPlay from '../src/AudioPlay'
// import src from './audio/beast.mp3' // change this to the path of your audio file
// import src from './audio/shed.mp3'
// import src from './audio/blurred-bonobo-remix.mp3'
import src from './audio/2019.01.13.1351.mp3'
import './index.scss';

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
        <AudioPlay src={src} />
      </Wrap>
    )
  }
}

function init () {
  const root = document.getElementById('app')
  render(<App />, root)
}

document.addEventListener('DOMContentLoaded', init)
