// @ts-expect-error
import ICAL from 'ical.js'
import type { RecurringDataArguments, ReturnedByApi } from './types.js'
import type Event from './Event.js'
import type DataHandler from './DataHandler.js'
import { getWeekNumber } from './helpers.js'

export interface WeekJsonable {
  readonly year: number
  readonly week: number
  readonly events: Array<ReturnType<Event['toPlainObject']>>
}

export default class Week implements RecurringDataArguments, ReturnedByApi<WeekJsonable> {
  readonly events: Event[]

  readonly year: number
  readonly week: number
  readonly start: ICAL.Time
  readonly end: ICAL.Time

  constructor (year: number, week: number, data: DataHandler) {
    this.year = year
    this.week = week
    this.start = Week.getMondayOfWeek(year, week, data.timezone as ICAL.Timezone)
    this.end = this.start.endOfWeek(ICAL.Time.MONDAY)

    this.events = Array.from(Week.#retrieveSingleEvents(year, week, data))
    for (let idx = 0, recurringEvent = data.recurringEvents[0]; idx < data.recurringEvents.length; recurringEvent = data.recurringEvents[++idx]) {
      this.events.push(...recurringEvent(this))
    }

    Object.freeze(this.events)
  }

  static getMondayOfWeek (year: number, week: number, timezone: ICAL.Timezone): ICAL.Time {
    const time = new ICAL.Time(
      {
        year,
        month: 1,
        day: 4, // January fourth is always in the specified year
        isDate: true
      },
      timezone
    )

    const diff = time.weekNumber(ICAL.Time.MONDAY) - week
    time.adjust(diff * 7, 0, 0, 0)

    return time.startOfWeek(ICAL.Time.MONDAY)
  }

  static * #retrieveSingleEvents (year: number, week: number, data: DataHandler): Generator<Event> {
    const asInt = year * 100 + week
    for (let idx = 0, event = data.events[0]; idx < data.events.length; event = data.events[++idx]) {
      const startWeek = getWeekNumber(event.start.toJSDate())
      const endWeek = getWeekNumber(event.end.toJSDate())
      const start = startWeek[0] + startWeek[1] * 100
      const end = endWeek[0] + endWeek[1] * 100

      if (start <= asInt && end >= asInt) {
        yield event
      }
    }
  }

  toPlainObject (): WeekJsonable {
    return {
      year: this.year,
      week: this.week,
      events: this.events.map(event => event.toPlainObject())
    }
  }
}
