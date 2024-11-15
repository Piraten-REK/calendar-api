import type Month from './Month'
import type { MonthInt, ReturnedByApi } from './types'
import type Event from './Event'

export interface DayJsonable {
  year: number
  month: MonthInt
  day: number
  events: Array<ReturnType<Event['toPlainObject']>>
}

export default class Day implements ReturnedByApi<DayJsonable> {
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

  toPlainObject (): DayJsonable {
    return {
      year: this.year,
      month: this.month,
      day: this.day,
      events: this.events.map(event => event.toPlainObject())
    }
  }

  toJson (space?: string | number): string {
    return JSON.stringify(this.toPlainObject(), null, space)
  }
}
