import * as ICAL from 'ical.js'
import Month from './Month'
import getNewData from './ical'
import { Event, RecurringEvent } from './Event'

export class UniqueSubArray<T extends unknown[]> extends Array<T> {
  constructor (...values: T[] | [number]) {
    const head = values.shift()
    if (head != null) {
      // @ts-expect-error
      super(head)
    } else {
      super()
    }

    for (let index = 0, element = values[0] as T; index < values.length; element = values[++index] as T) {
      this.push(element)
    }
  }

  push (...values: T[]): number {
    for (let idx = 0, value = values[0]; idx < values.length; value = values[++idx]) {
      let index = this.findIndex(it => it.every((element, index) => element === value[index]))

      if (index !== -1) {
        return ++index
      }

      Array.prototype.push.call(this, value)
    }

    return this.length
  }
}

class DataHandler {
  /** Map of Months indexed by year and month */
  #data = new Map<number, Map<number, Month>>()
  /** Array of all recurring Events in data source */
  #recurringEvents: RecurringEvent[] = []
  /** Timezone for all data */
  #timezone: ICAL.Timezone | null = null
  /** Date on which the data was last updated */
  #lastModified: Date = new Date(0)

  constructor () {
    this.pullData()
    setInterval(() => {
      const now = Date.now()
      if (now - this.#lastModified.getTime() >= 10 * 60 * 1000) {
        this.pullData()
      }
    }, 500)
  }

  /** Timezone for all data */
  get timezone (): ICAL.Timezone | null {
    return this.#timezone != null
      ? new ICAL.Timezone(this.#timezone.component)
      : null
  }

  /** Date on which the data was last updated */
  get lastModified (): Date {
    return this.#lastModified
  }

  /** Retrieves new data from the data source */
  pullData (): void {
    getNewData()
      .then(({ singleEvents, recurringEvents, timezone }) => {
        for (let i = 0, event = singleEvents[i]; i < singleEvents.length; event = singleEvents[++i]) {
          const months = this.#whichMonths(event)
          for (let q = 0, [year, month] = months[0]; q < months.length; [year, month] = months[++q]) {
            if (!this.#data.has(year)) this.#data.set(year, new Map<number, Month>())
            if (!(this.#data.get(year) as Map<number, Month>).has(month)) {
              (this.#data.get(year) as Map<number, Month>).set(month, new Month(year, month, [event], timezone))
            } else {
              ((this.#data.get(year) as Map<number, Month>).get(month) as Month).addEvent(event)
            }
          }
        }

        this.#recurringEvents = recurringEvents

        this.#timezone = timezone
        this.#lastModified.setTime(Date.now())

        console.log('[%s] Data pulled', this.#lastModified.toUTCString())
      })
      .catch(e => {
        console.error('[%s] Unable to fetch data\n', (new Date()).toUTCString())
        console.error(e)
      })
  }

  /**
   * Returns an Array of months the given Event affects as number tupels representing year and month
   * @param event The Event to check for
   */
  #whichMonths (event: Event): Array<[number, number]> {
    if (
      event.start.year === event.end.year &&
      event.start.month === event.end.month
    ) {
      return [[
        event.start.year,
        event.start.month
      ]]
    }

    const result = new UniqueSubArray<[number, number]>(
      [event.start.year, event.start.month],
      [event.end.year, event.end.month]
    )

    for (let month = event.end.month - event.start.month + ((event.end.year - event.start.year) * 12); month > 1; month--) {
      result.push([
        (month + event.start.month - 2) % 12 + 1,
        Math.floor((month + event.start.month) / 12) + event.start.year
      ])
    }

    if (
      event.start.weekNumber(ICAL.Time.MONDAY) === event.start.startOfMonth().weekNumber(ICAL.Time.MONDAY) &&
      event.end.endOfWeek(ICAL.Time.MONDAY).dayOfWeek(ICAL.Time.MONDAY) !== ICAL.Time.SUNDAY
    ) {
      let month = event.end.month
      let year = event.end.year
      if (month < 1) {
        month = 12
        year--
      }
      result.push([year, month])
    }

    if (
      event.end.weekNumber(ICAL.Time.MONDAY) === event.end.endOfMonth().weekNumber(ICAL.Time.MONDAY) &&
      event.end.endOfWeek(ICAL.Time.MONDAY).dayOfWeek(ICAL.Time.MONDAY) !== ICAL.Time.SUNDAY
    ) {
      let month = event.end.month
      let year = event.end.year
      if (month > 12) {
        month = 1
        year++
      }
      result.push([year, month])
    }

    return Array.from(result)
  }

  /**
   * Returns an Array of all Events of the given month as plain JavaScript objects to be returned in the REST API as JSON
   * @param year Number of year
   * @param month Number of month
   */
  getMonth (year: number, month: number): ReturnType<Month['toJson']> {
    if (!this.#data.has(year)) this.#data.set(year, new Map<number, Month>())
    if (!(this.#data.get(year) as Map<number, Month>).has(month)) {
      (this.#data.get(year) as Map<number, Month>).set(month, new Month(year, month, [], this.#timezone as ICAL.Timezone))
    }
    return ((this.#data.get(year) as Map<number, Month>).get(month) as Month).toJson(this.#recurringEvents)
  }

  /**
   * Returns an Array of all Events of the given day as plain JavaScript objects to be returned in the REST API as JSON
   * @param year Number of year
   * @param month Number of month
   * @param day Number of day
   */
  getDay (year: number, month: number, day: number): ReturnType<Month['dayToJson']> {
    if (!this.#data.has(year)) this.#data.set(year, new Map<number, Month>())
    if (!(this.#data.get(year) as Map<number, Month>).has(month)) {
      (this.#data.get(year) as Map<number, Month>).set(month, new Month(year, month, [], this.#timezone as ICAL.Timezone))
    }
    return ((this.#data.get(year) as Map<number, Month>).get(month) as Month).dayToJson(day, this.#recurringEvents)
  }
}
/**
 * DataHandler singleton
 * @see DataHandler
 */
const dataHandler = new DataHandler()

export default dataHandler
