import _ from 'lodash'

const profilerPlus = _.memoize(() => new ProfilerPlus())
export default class ProfilerPlus {
  private measures: { [key: string]: any } = {}
  private overridenObjects: { [key: string]: any } = {}
  private callStack: string[] = []
  private ticksToMeasure: number = 0
  private strResult = ''

  overrideFn<T>(object: T & any, name: string = object.name) {
    this.overridenObjects[name] = { call: object }
    return (...args: any[]) => this.overridenObjects[name].call(...args)
  }

  overrideObject<T>(object: T & any, name: string = object.name) {
    this.overridenObjects[name] = object.prototype || object
    return object
  }

  start(ticksToMeasure = Infinity) {
    this.ticksToMeasure = ticksToMeasure
    const that = this
    _.forEach(this.overridenObjects, (o, name) => {
      _.forOwn(o, (fn, key) => {
        if (!key) {
          return
        }
        const descriptor = Object.getOwnPropertyDescriptor(o, key)
        if (!descriptor || descriptor.get || descriptor.set) {
          return
        }
        if (
          typeof fn === 'function' &&
          key !== 'constructor' &&
          key !== 'getUsed'
        ) {
          o[`_${key}`] = fn
          o[key] = function () {
            that.callStack.push(`${name}#${key}`)
            const now = Game.cpu.getUsed()
            const result = o[`_${key}`].apply(this, arguments)
            const time = Game.cpu.getUsed() - now
            that.saveMeasurement(time)
            that.callStack.pop()
            return result
          }
          console.log('overriding', name, key)
        }
      })
    })
  }

  tick() {
    this.ticksToMeasure--
    if (!this.ticksToMeasure) {
      this.stop()
    }
  }

  stop() {
    this.ticksToMeasure = 0
    _.forEach(this.overridenObjects, (o, name) => {
      _.forOwn(o, (fn, key) => {
        if (typeof fn === 'function' && key?.startsWith('_')) {
          o[key.slice(1)] = fn
          console.log('overriding', name, key)
        }
      })
    })
  }

  saveMeasurement(time: number) {
    const last = this.callStack[this.callStack.length - 1]
    this.callStack.forEach((__, i) => {
      let measures = this.measures
      this.callStack.slice(i).forEach((name) => {
        let measure = measures[name]
        if (!measure) {
          measure = measures[name] = {
            calls: 0,
            time: 0,
            max: 0,
            min: Infinity,
          }
        }
        if (name === last) {
          measure.calls++
          measure.time += time
          measure.max = Math.max(measure.max, time)
          measure.min = Math.min(measure.min, time)
        }
        measures = measure
      })
    })
  }

  printResult(measures = this.measures, depthString = '|-') {
    const topLevel = depthString === '|-'
    if (topLevel) {
      this.strResult =
        '<table><th><td>Function name</td><td>Total calls</td><td>Min cost</td><td>Max cost</td><td>Avg cost</td></th>'
    }
    _.forEach(measures, (measure, key) => {
      if (!key) {
        return
      }
      if (typeof measure === 'object') {
        const name = depthString + key
        const minCost = measure.min.toPrecision(3)
        const maxCost = measure.max.toPrecision(3)
        const calls = measure.calls
        const avgCost = (measure.time / measure.calls).toPrecision(3)
        this.strResult += `<tr><td>${name}</td><td>${calls}</td><td>${minCost}</td><td>${maxCost}</td><td>${avgCost}</td></tr>`
        this.printResult(measure, '  ' + depthString)
      }
    })
    if (topLevel) {
      this.strResult += '</table>'
      console.log(this.strResult)
      this.strResult = ''
    }
  }

  static get instance() {
    return profilerPlus()
  }
}
