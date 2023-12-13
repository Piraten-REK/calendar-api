import * as ICAL from 'ical.js'
import { Event, EventAsJson, RecurringEvent } from './Event'

/**
 * Class Month
 * Month containig all Events in said month
 */
export default class Month {
  /** Private set of Events in Month */
  #data: Set<Event> = new Set()

  /** Timezone for this Month and all contained Events */
  #timezone: ICAL.Timezone

  /** Year of this Month */
  #year: number

  /**
   * Number of this Month
   * where 1 is Januaray and 12 is December
   */
  #month: number

  /**
   * First visible day on a calendar page
   * may be day of previous Month
   */
  #firstVisible: ICAL.Time

  /**
   * Last visible day on a calendar page
   * may be day of next Month
   */
  #lastVisible: ICAL.Time

  /**
   * Constructor for Month
   * @param year Year of this Month
   * @param month Number of this Month where 1 is Januaray and 12 is December
   * @param data Single Events in this month
   * @param timezone Timezone for this Month and all contained Events
   */
  constructor (year: number, month: number, data: Event[], timezone: ICAL.Timezone) {
    this.#year = year
    this.#month = month
    for (let idx = 0, event = data[0]; idx < data.length; event = data[++idx]) {
      this.#data.add(event)
    }
    this.#timezone = timezone
    this.#firstVisible = new ICAL.Time({
      year: this.#year,
      month: this.#month,
      day: 1,
      isDate: true
    }, this.#timezone).startOfWeek(ICAL.Time.MONDAY)
    this.#lastVisible = new ICAL.Time({
      year: this.#year,
      month: this.#month,
      day: 1,
      isDate: true
    }, this.#timezone).endOfWeek(ICAL.Time.MONDAY)
    this.#lastVisible.adjust(6 * 7, 0, 0, 0)
  }

  /** Array of Events in Month */
  get data (): Event[] {
    return Array.from(this.#data)
  }

  /** Timezone for this Month and all contained Events */
  get timezone (): ICAL.Timezone {
    return this.#timezone
  }

  /** Year of this Month */
  get year (): number {
    return this.#year
  }

  /**
   * Number of this Month
   * where 1 is Januaray and 12 is December
   */
  get month (): number {
    return this.#month
  }

  /**
   * First visible day on a calendar page
   * may be day of previous Month
   */
  get firstVisible (): ICAL.Time {
    return this.#firstVisible
  }

  /**
   * Last visible day on a calendar page
   * may be day of prepending Month
   */
  get lastVisible (): ICAL.Time {
    return this.#lastVisible
  }

  /**
   * Adds an Event to this Month
   * @param event Event to be added
   */
  addEvent (event: Event): void {
    this.#data.add(event)
  }

  /**
   * Return an array of playin JavaScript objects to be returned as JSON in the REST API
   * @param recurringEvents Array of recurring events
   */
  toJson (recurringEvents: RecurringEvent[]): EventAsJson[] {
    return this.data
      .concat(...recurringEvents.map(recurring => recurring(this)))
      .map(event => event.toJson())
  }

  /**
   * Returns an array of all Events on the given day in this Month
   * @param day Number of day this method is called for
   * @param recur Array of RecurrentEvents
   */
  getDay (day: number, recurringEvents: RecurringEvent[]): Event[] {
    const date = new ICAL.Time({
      year: this.#year,
      month: this.#month,
      day,
      isDate: true
    }, this.#timezone)

    return this.data
      .concat(...recurringEvents.map(recurring => recurring(this)))
      .filter(event => this.#affectsDate(event, date))
  }

  /**
   * Returns an array of plain JavaScript Objects to be returned in the REST API as JSON
   * @param day Number of day this method is called for
   * @param recur Array of RecurrentEvents
   */
  dayToJson (day: number, recurringEvents: RecurringEvent[]): EventAsJson[] {
    return this.getDay(day, recurringEvents)
      .map(event => event.toJson())
  }

  /**
   * Private method that checks whether an Event affects a certain date
   * @param event Event to be checked
   * @param date Date tp be checked for
   */
  #affectsDate (event: Event, date: ICAL.Time): boolean {
    return event.start.compareDateOnlyTz(date, this.#timezone) <= 0 &&
      event.end.compareDateOnlyTz(date, this.#timezone) >= 0
  }

  /** Resets this Month to 0 entries */
  reset (): void {
    this.#data.clear()
  }
}
