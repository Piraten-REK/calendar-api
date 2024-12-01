import type BaseDay from './BaseDay'
import type { DayJsonable } from './BaseDay'
import type Event from './Event'
import EventInDay from './EventInDay'
import type Month from './Month'
import type { MonthInt } from './types'

export default class Day implements BaseDay {
  readonly year: number
  readonly month: MonthInt
  readonly day: number
  readonly events: Event[]
  readonly #asInt: number

  constructor (month: Month, day: number) {
    this.year = month.year
    this.month = month.month
    this.day = day

    this.#asInt = this.year * 10000 + this.month * 100 + this.day

    this.events = month.events.filter(event => {
      const start = event.start.year * 10000 + event.start.month * 100 + (event.start.day as number)
      const end = event.end.year * 10000 + event.end.month * 100 + (event.end.day as number)

      return start <= this.#asInt && end >= this.#asInt
    })
  }

  getId (id: string): EventInDay {
    return new EventInDay(this, id)
  }

  toPlainObject (): DayJsonable {
    return {
      year: this.year,
      month: this.month,
      day: this.day,
      events: this.events.map(event => event.toPlainObject())
    }
  }
}
