// @ts-expect-error
import ICAL from 'ical.js'
import type Event from './Event.js'
import type DataHandler from './DataHandler.js'
import type { MonthInt } from './types.js'
import Day from './Day.js'
import { mapGetOrSet } from './helpers.js'
import BaseMonth, { type MonthJsonable } from './BaseMonth.js'
import EventInMonth from './EventInMonth.js'

export default class Month implements BaseMonth {
  readonly events: Event[]

  readonly year: number
  readonly month: MonthInt
  readonly start: ICAL.Time
  readonly end: ICAL.Time

  readonly days = new Map<number, Day>()

  constructor (year: number, month: MonthInt, dataHandler: DataHandler) {
    this.year = year
    this.month = month
    this.start = new ICAL.Time({
      year,
      month,
      day: 1,
      isDate: true
    }, dataHandler.timezone as ICAL.Timezone).startOfWeek(ICAL.Time.MONDAY)
    this.end = this.start.clone().adjust(41, 0, 0, 0)

    this.events = Array.from(Month.#retrieveSingleEvents(year, month, dataHandler))
    for (let idx = 0, recurringEvent = dataHandler.recurringEvents[0]; idx < dataHandler.recurringEvents.length; recurringEvent = dataHandler.recurringEvents[++idx]) {
      this.events.push(...recurringEvent(this))
    }

    Object.freeze(this.events)
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

  getId (id: string): EventInMonth {
    return new EventInMonth(this, id)
  }

  static * #retrieveSingleEvents (year: number, month: MonthInt, dataHandler: DataHandler): Generator<Event> {
    const asInt = year * 100 + month
    for (
      let idx = 0, event = dataHandler.events[0];
      idx < dataHandler.events.length;
      event = dataHandler.events[++idx]
    ) {
      const start = event.start.year * 100 + event.start.month
      const end = event.end.year * 100 + event.end.month

      if (start <= asInt && end >= asInt) {
        yield event
      }
    }
  }
}
