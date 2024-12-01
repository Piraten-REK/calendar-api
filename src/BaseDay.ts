import type { MonthInt, ReturnedByApi } from './types'
import type Event from './Event'

export interface DayJsonable {
  year: number
  month: MonthInt
  day: number
  events: Array<ReturnType<Event['toPlainObject']>>
}

export default interface BaseDay extends ReturnedByApi<DayJsonable> {
  readonly year: number
  readonly month: MonthInt
  readonly day: number
  readonly events: Event[]

  toPlainObject: () => DayJsonable
}
