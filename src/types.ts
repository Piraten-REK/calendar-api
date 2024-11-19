// @ts-expect-error
import type ICAL from 'ical.js'
import type Event from './Event.js'

export type MonthInt = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export interface Month {
  year: number
  month: MonthInt
  readonly firstWeekMonday: ICAL.Time
  readonly lastWeekExtSunday: ICAL.Time
}

export type RecurringEvent = (month: Month) => Generator<Event>

export interface ReturnedByApi <Jsonable extends Object> {
  toPlainObject: () => Jsonable
}

export type ProblemObj <Additional extends Record<string, unknown> = {}> = {
  status: number
  type?: string
  title?: string
  detail?: string
  instance?: string
} & Additional
