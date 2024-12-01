import type BaseDay from './BaseDay'
import Day from './Day'
import type { MonthInt } from './types'
import Event from './Event'
import type { DayJsonable } from './BaseDay'

export default class EventInDay implements BaseDay {
  readonly #day: Day

  get year (): number {
    return this.#day.year
  }

  get month (): MonthInt {
    return this.#day.month
  }

  get day (): number {
    return this.#day.day
  }

  readonly events: Event[]

  get empty (): boolean {
    return this.events.length === 0
  }

  constructor (day: Day, id: string) {
    this.#day = day

    this.events = day.events.filter(event => event.id === id)
  }

  toPlainObject (): DayJsonable {
    return Day.prototype.toPlainObject.call(this)
  }
}
