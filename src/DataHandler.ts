import env from './env.js'
// @ts-expect-error
import ICAL from 'ical.js'
import Event from './Event.js'
import type { RecurringEvent, RecurringDataArguments, MonthInt } from './types.js'
import Month from './Month.js'
import Week from './Week.js'
import { mapGetOrSet } from './helpers.js'
import type Day from './Day.js'

export default class DataHandler {
  timezone: ICAL.Timezone | null = null
  events: Event[] = []
  recurringEvents: RecurringEvent[] = []
  #lastUpdate: Date = new Date(0)
  #iterator: NodeJS.Timeout | null = null
  months = new Map<number, Map<MonthInt, Month>>()
  weeks = new Map<number, Map<number, Week>>()
  eventMap = new Map<string, Event[]>()

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

    const [events, timezone] = await this.#getEvents()

    const singleEvents: Event[] = []
    const recurringEvents: RecurringEvent[] = []

    for (let idx = 0, event = events[0]; idx < events.length; event = events[++idx]) {
      if (!event.isRecurring()) {
        singleEvents.push(
          new Event(event)
        )
      } else {
        function * recurringEvent (this: DataHandler, month: RecurringDataArguments): Generator<Event> {
          const iterator = event.iterator(month.start)

          let val = iterator.next()
          while (!iterator.complete && month.end.compareDateOnlyTz(val as any, this.timezone as ICAL.Timezone) >= 0) {
            if (val.compareDateOnlyTz(event.startDate as any, this.timezone as ICAL.Timezone) === -1) {
              val = iterator.next()
              continue
            }

            yield Event.createWithDiff(event, val)

            val = iterator.next()
          }
        }

        recurringEvents.push(
          recurringEvent.bind(this) as RecurringEvent
        )
      }
    }

    this.events = singleEvents
    this.recurringEvents = recurringEvents
    this.timezone = timezone
    this.#lastUpdate = new Date()

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
}
