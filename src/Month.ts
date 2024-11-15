// @ts-expect-error
import ICAL from 'ical.js'
import type Event from './Event.js'
import type DataHandler from './DataHandler.js'
import type { Month as IMonth, MonthInt, ReturnedByApi } from './types.js'
import Day from './Day.js'
import { mapGetOrSet } from './helpers.js'

export interface MonthJsonable {
  readonly year: number
  readonly month: MonthInt
  readonly events: Array<ReturnType<Event['toPlainObject']>>
}

export default class Month implements IMonth, ReturnedByApi<MonthJsonable> {
  readonly events: Event[]

  readonly year: number
  readonly month: MonthInt
  readonly firstWeekMonday: ICAL.Time
  readonly lastWeekExtSunday: ICAL.Time

  readonly days = new Map<number, Day>()

  constructor (year: number, month: MonthInt, data: DataHandler) {
    this.year = year
    this.month = month
    this.firstWeekMonday = new ICAL.Time({
      year,
      month,
      day: 1,
      isDate: true
    }, data.timezone as ICAL.Timezone).startOfWeek(ICAL.Time.MONDAY)
    this.lastWeekExtSunday = this.firstWeekMonday.clone().adjust(41, 0, 0, 0)

    this.events = Array.from(Month.#retrieveSingleEvents(year, month, data))
    for (let idx = 0, recurringEvent = data.recurringEvents[0]; idx < data.recurringEvents.length; recurringEvent = data.recurringEvents[++idx]) {
      this.events.push(...recurringEvent(this))
    }

    Object.freeze(this.events)
  }

  static * #retrieveSingleEvents (year: number, month: MonthInt, data: DataHandler): Generator<Event> {
    const asInt = year * 100 + month
    for (let idx = 0, event = data.events[0]; idx < data.events.length; event = data.events[++idx]) {
      const start = event.start.year * 100 + event.start.month
      const end = event.end.year * 100 + event.end.month

      if (start <= asInt && end >= asInt) {
        yield event
      }
    }
  }

  getDay (day: number): Day {
    return mapGetOrSet(this.days, day, () => new Day(this, day))
  }

  toPlainObject (): MonthJsonable {
    return {
      year: this.year,
      month: this.month,
      events: this.events.map(event => event.toPlainObject())
    }
  }

  toJson (space?: number | string): string {
    return JSON.stringify(this.toPlainObject(), null, space)
  }
}
