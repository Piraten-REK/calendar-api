import env from './env.js'
// @ts-expect-error
import ICAL from 'ical.js'
import Event from './Event.js'
import type { RecurringEvent, Month as IMonth, MonthInt } from './types.js'
import Month from './Month.js'
import { mapGetOrSet } from './helpers.js'
import type Day from './Day.js'

export default class DataHandler {
  timezone: ICAL.Timezone | null
  events: Event[] = []
  recurringEvents: RecurringEvent[] = []
  #lastUpdate: Date = new Date(0)
  #iterator: NodeJS.Timeout | null = null
  months = new Map<number, Map<MonthInt, Month>>()

  constructor (timezone?: ICAL.Timezone) {
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

    console.log('STATIC', events.find(event => event.uid === '4e1f53ca-7a12-48c1-b5b8-a147bae3f404'))

    const singleEvents: Event[] = []
    const recurringEvents: RecurringEvent[] = []

    for (let idx = 0, event = events[0]; idx < events.length; event = events[++idx]) {
      if (!event.isRecurring()) {
        singleEvents.push(
          new Event(event)
        )
      } else {
        function * recurringEvent (this: DataHandler, month: IMonth): Generator<Event> {
          const iterator = event.iterator(month.firstWeekMonday)

          let val = iterator.next()
          while (!iterator.complete && month.lastWeekExtSunday.compareDateOnlyTz(val as any, this.timezone as ICAL.Timezone) >= 0) {
            if (val.compareDateOnlyTz(event.startDate as any, this.timezone as ICAL.Timezone) === -1) {
              continue
            }

            console.log('RECUR', events.find(event => event.uid === '4e1f53ca-7a12-48c1-b5b8-a147bae3f404'))

            yield Event.createWithDiff(event, val)

            val = iterator.next()
          }
        }
        recurringEvents.push(recurringEvent.bind(this))
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
    return mapGetOrSet(
      mapGetOrSet(this.months, year, () => new Map<MonthInt, Month>()),
      month,
      () => new Month(year, month, this)
    )
  }

  getDay (year: number, month: MonthInt, day: number): Day {
    return this.getMonth(year, month).getDay(day)
  }
}
