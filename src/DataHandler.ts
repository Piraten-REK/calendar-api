import env from './env.js'
// @ts-expect-error
import ICAL from 'ical.js'
import Event from './Event.js'
import type { MonthInt, CurrentEvents, CurrentEventsJsonable } from './types.js'
import Month from './Month.js'
import Week from './Week.js'
import { mapGetOrSet } from './helpers.js'
import type Day from './Day.js'
import { START_YEAR, END_YEAR_OFFSET, MAX_NEXT } from './config'

export default class DataHandler {
  timezone: ICAL.Timezone | null = null
  events: Event[] = []
  #lastUpdate: Date = new Date(0)
  #iterator: NodeJS.Timeout | null = null
  months = new Map<number, Map<MonthInt, Month>>()
  weeks = new Map<number, Map<number, Week>>()
  eventMap = new Map<string, Event[]>()
  nextEvents: Pick<CurrentEvents, 'events' | 'date'> | null = null

  static #instance: DataHandler | null = null

  constructor (timezone?: ICAL.Timezone) {
    if (DataHandler.#instance != null) {
      return DataHandler.#instance
    }

    DataHandler.#instance = this

    this.timezone = timezone ?? null

    void this.fetch()
  }

  get lastUpdate (): Date {
    return new Date(this.#lastUpdate)
  }

  async #getString (): Promise<string> {
    return await fetch(env.ICAL_URL)
      .then(async res => {
        if (res.status !== 200) {
          throw new Error('Unable to fetch data')
        }

        return await res.text()
      })
  }

  async #getEvents (): Promise<[ICAL.Event[], ICAL.Timezone]> {
    return await this.#getString()
      .then(string => {
        try {
          const data = ICAL.parse(string)
          const component = new ICAL.Component(data)
          const events = component.getAllSubcomponents('vevent').map(event => new ICAL.Event(event))
          const timezone = new ICAL.Timezone(component.getFirstSubcomponent('vtimezone') as ICAL.Component)

          return [events, timezone]
        } catch (err) {
          if (err instanceof Error) {
            throw err
          } else if (typeof err === 'string') {
            throw new Error(err)
          }
          throw new Error('Unable to parse data')
        }
      })
  }

  async fetch (): Promise<void> {
    if (this.#iterator != null) {
      clearTimeout(this.#iterator)
      this.#iterator = null
    }

    const [icalEvents, timezone] = await this.#getEvents()

    const start = new ICAL.Time({ year: START_YEAR, month: 1, day: 1, isDate: true }, timezone)
    const end = new ICAL.Time({
      year: new Date().getFullYear() + END_YEAR_OFFSET,
      month: 12,
      day: 31,
      isDate: true
    }, timezone)

    const events: Event[] = []

    for (let idx = 0, event = icalEvents[0]; idx < icalEvents.length; event = icalEvents[++idx]) {
      if (!event.isRecurring()) {
        events.push(
          new Event(event)
        )
      } else {
        const iterator = event.iterator(start)

        let val = iterator.next()
        while (!iterator.complete && end.compareDateOnlyTz(val as any, timezone) >= 0) {
          if (val.compareDateOnlyTz(event.startDate as any, timezone) === -1) {
            val = iterator.next()
            continue
          }

          events.push(Event.createWithDiff(event, val))
          val = iterator.next()
        }
      }
    }

    this.events = events
    this.timezone = timezone
    this.#lastUpdate = new Date()
    this.nextEvents = null

    this.#iterator = setTimeout(() => {
      void this.fetch()
    }, 600000)
  }

  getMonth (year: number, month: MonthInt): Month {
    const yearMap = mapGetOrSet(this.months, year, () => new Map<MonthInt, Month>())
    return mapGetOrSet(
      yearMap,
      month,
      () => new Month(year, month, this)
    )
  }

  getDay (year: number, month: MonthInt, day: number): Day {
    return this.getMonth(year, month).getDay(day)
  }

  getWeek (year: number, week: number): Week {
    const yearMap = mapGetOrSet(this.weeks, year, () => new Map<number, Week>())
    return mapGetOrSet(
      yearMap,
      week,
      () => new Week(year, week, this)
    )
  }

  async getNext (n: number): Promise<CurrentEvents> {
    n = Math.min(n, MAX_NEXT)

    if (this.nextEvents != null) {
      return {
        events: this.nextEvents.events.splice(0, Math.min(this.nextEvents.events.length, n)),
        max: n,
        date: this.nextEvents.date,
        toPlainObject (): CurrentEventsJsonable {
          return {
            events: this.events.map(event => event.toPlainObject()),
            date: this.date.toISOString().split('T')[0],
            max: n
          }
        }
      } satisfies CurrentEvents
    }

    const now = new Date()
    const events: Event[] = []

    const asInt = now.getFullYear() * 100 + now.getDate()
    for (
      let idx = 0, event = this.events[0];
      idx < this.events.length;
      event = this.events[++idx]
    ) {
      const start = event.start.year * 100 + event.start.month
      const end = event.end.year * 100 + event.end.month

      if ((start <= asInt && end >= asInt) || start > asInt) {
        events.push(event)
      }
    }

    this.nextEvents = {
      events: events
        .sort((a, b) => a.start.toUnixTime() - b.start.toUnixTime()),
      date: now
    }

    return {
      events: events
        .sort((a, b) => a.start.toUnixTime() - b.start.toUnixTime())
        .slice(0, Math.min(events.length, n)),
      date: now,
      max: n,
      toPlainObject (): CurrentEventsJsonable {
        return {
          events: this.events.map(event => event.toPlainObject()),
          date: this.date.toISOString().split('T')[0],
          max: this.max
        }
      }
    } satisfies CurrentEvents
  }
}
