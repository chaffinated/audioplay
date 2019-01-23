import React from 'react'
import PlayStatus from '../constants/PlayStatus';

export default ({className = 'icon-play', status, ...props}) => {
  const playMask = status === PlayStatus.PLAYING
    ? 'playing'
    : 'paused';

  return (
    <svg className={className} {...props} xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fillRule="evenodd">
      <defs>
        <mask id="paused">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <polygon points="36 30, 70 50, 70 50, 36 70" fill="black" />
        </mask>
        <mask id="playing">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <polygon points="36 30, 70 30, 70 50, 36 70" fill="black" />
        </mask>
      </defs>
      <circle cx="50" cy="50" r="50" mask={`url(#${playMask})`} />
    </svg>
  )
}
