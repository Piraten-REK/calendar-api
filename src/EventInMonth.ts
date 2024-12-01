// @ts-expect-error
import ICAL from 'ical.js'
import type Event from './Event.js'
import type BaseMonth from './BaseMonth.js'
import Month from './Month.js'
import type { MonthInt } from './types.js'
import type Day from './Day.js'
import type { MonthJsonable } from './BaseMonth.js'

export default class EventInMonth implements BaseMonth {
  readonly #month: Month

  readonly events: Event[]

  get year (): number {
    return this.#month.year
  }

  get month (): MonthInt {
    return this.#month.month
  }

  get start (): ICAL.Time {
    return this.#month.start
  }

  get end (): ICAL.Time {
    return this.#month.end
  }

  readonly days = new Map<number, Day>()

  get empty (): boolean {
    return this.events.length === 0
  }

  constructor (month: Month, id: string) {
    this.#month = month

    this.events = month.events.filter(event => event.id === id)
  }

  getDay (day: number): Day {
    return Month.prototype.getDay.call(this, day)
  }

  toPlainObject (): MonthJsonable {
    return Month.prototype.toPlainObject.call(this)
  }
}
