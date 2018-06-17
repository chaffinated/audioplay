const MS = 16

class Ticker {
  constructor ({pauseInBackground = true, autostart = true} = {}) {
    this.ticking = false
    this.paused = false
    this.queue = []
    this.startTimes = []
    this.times = []
    this.mutateTasks = []
    this.measureTasks = []
    this.autostart = autostart
    this.lastTime = null
    if (!pauseInBackground) {
      window.document.addEventListener('visibilitychange', () => {
        this.pause(window.document.hidden)
      })
    }
  }

  pause = () => {
    this.paused = true
  }

  start = () => {
    this.paused = false
    this.tick(window.performance.now())
  }

  tick = (t) => {
    const {tick, startTimes, times, queue, paused, measureTasks, mutateTasks} = this
    this.lastTime = this.lastTime || t
    const delta = t - this.lastTime
    if (queue.length === 0) {
      this.ticking = false
      return
    }
    if (delta < MS) {
      window.requestAnimationFrame(tick)
      return
    }

    this.lastTime = t

    var i = queue.length - 1
    while (i >= 0) {
      const component = queue[i]
      if (startTimes[i] == null) startTimes[i] = t
      times[i] = t - startTimes[i]
      if (component.animationPaused || paused) {
        startTimes[i] += delta
      } else {
        component.update(times[i])
        component.draw(times[i])
      }
      i--
    }

    window.requestAnimationFrame(tick)
  }

  push = (component) => {
    const {queue, tick} = this
    queue.push(component)
    if (this.ticking || !this.autostart) {
      return
    }
    tick(window.performance.now())
    this.ticking = true
  }

  clear = (component) => {
    const {queue, times, startTimes, measureTasks, mutateTasks} = this
    const idx = queue.indexOf(component)
    queue.splice(idx, 1)
    times.splice(idx, 1)
    startTimes.splice(idx, 1)
  }
}

const T = new Ticker()

// The default export should be a singleton to prevent careless
// instantiations causing multiple rAF loops (which is bad for performance)
export default T

export { Ticker }
