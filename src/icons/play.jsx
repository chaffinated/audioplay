import React from 'react'

export default ({className = 'icon-play', ...props}) => {
  return (
    <svg className={className} {...props} xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fillRule="evenodd">
      <defs>
        <mask id="paused">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <polygon points="36 30, 70 50, 70 50, 36 70" fill="black" />
        </mask>
      </defs>
      {/* <path d='M12 0c-7 0-12 5-12 12s5 12 12 12 12-5 12-12-5-12-12-12zm-3 17v-10l9 5-9 5z' /> */}
      <circle cx="50" cy="50" r="50" mask="url(#paused)" />
      
    </svg>
  )
}
