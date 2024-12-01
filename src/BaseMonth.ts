// @ts-expect-error
import ICAL from 'ical.js'
import type Event from './Event.js'
import type { RecurringDataArguments, MonthInt, ReturnedByApi } from './types.js'
import Day from './Day.js'

export interface MonthJsonable {
  readonly year: number
  readonly month: MonthInt
  readonly events: Array<ReturnType<Event['toPlainObject']>>
}

export default interface BaseMonth extends RecurringDataArguments, ReturnedByApi<MonthJsonable> {
  readonly events: Event[]

  readonly year: number
  readonly month: MonthInt
  readonly start: ICAL.Time
  readonly end: ICAL.Time

  readonly days: Map<number, Day>

  getDay: (day: number) => Day

  toPlainObject: () => MonthJsonable
}
