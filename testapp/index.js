import React, { Component } from 'react'
import { render } from 'react-dom'
import AudioPlay from '../src/AudioPlay'
import src from './audio/time-traveler.mp3'
import './index.scss';

class App extends Component {
  render () {
    return (
      <div className='screen-wrap'>
        <AudioPlay src={src} />
      </div>
    )
  }
}

function init () {
  const root = document.getElementById('app')
  render(<App />, root)
}

document.addEventListener('DOMContentLoaded', init)
