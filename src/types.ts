// @ts-expect-error
import type ICAL from 'ical.js'
import type Event from './Event.js'

export type MonthInt = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export interface RecurringDataArguments {
  readonly start: ICAL.Time
  readonly end: ICAL.Time
}

export type RecurringEvent = (data: RecurringDataArguments) => Generator<Event>

export type AnyEvent = Event | RecurringEvent

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

export interface CurrentEventsJsonable {
  readonly events: Array<ReturnType<Event['toPlainObject']>>
  readonly date: string
  readonly max: number
}

export interface CurrentEvents extends ReturnedByApi<CurrentEventsJsonable> {
  events: Event[]
  date: Date
  max: number

  toPlainObject: () => CurrentEventsJsonable
}
