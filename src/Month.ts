import ICAL from 'ical.js'
import Event, { RecurringEvent } from './Event.js'

/**
 * @class Month
 *
 * Month containig all Events in said month
 *
 * @since 1.0.0
 */
export default class Month {
  /** Private set of Events in Month */
  #data: Set<Event>

  /** Timezone for this Month and all contained Events */
  public readonly timezone: ICAL.Timezone

  /** Year of this Month */
  public readonly year: number

  /**
   * Number of this Month
   * where 1 is Januaray and 12 is December
   */
  public readonly month: number

  /**
   * First visible day on a calendar page
   * may be day of previous Month
   */
  public readonly firstVisible: ICAL.Time

  /**
   * Last visible day on a calendar page
   * may be day of prepending Month
   */
  public readonly lastVisible: ICAL.Time

  /**
   * Constructor for Month
   * @param year Year of this Month
   * @param month Number of this Month where 1 is Januaray and 12 is December
   * @param data Single Events in this month
   * @param timezone Timezone for this Month and all contained Events
   */
  constructor (year: number, month: number, data: Event[], timezone: ICAL.Timezone) {
    this.year = year
    this.month = month
    this.#data = new Set<Event>(data)
    this.timezone = timezone

    this.firstVisible = new ICAL.Time({
      year: this.year,
      month: this.month,
      day: 1,
      isDate: true
    }, timezone).startOfWeek(ICAL.Time.MONDAY)

    this.lastVisible = this.firstVisible.clone()
    this.lastVisible.addDuration(new ICAL.Duration({
      weeks: 5,
      days: 6,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isNegative: false
    }))
  }

  /** Array of Events in Month */
  get data (): Event[] {
    return Array.from(this.#data)
  }

  /**
   * Adds an Event to this Month
   * @param event Event to be added
   */
  addEvent (event: Event): void {
    this.#data.add(event)
  }

  /**
   * Returns an Array of plain JavaScript Objects to be returned in the REST API as JSON
   * @param recurringEvents Array of RecurrentEvents
   */
  toJSONObject (recurringEvents: RecurringEvent[]): Array<ReturnType<Event['toJSONObject']>> {
    return this.data
      .concat(...recurringEvents.map(event => event(this)))
      .map(event => event.toJSONObject())
  }

  /**
   * Returns an Array of all Events on the given day in this Month
   * @param day Number of day this method is called for
   * @param recur Array of RecurrentEvents
   */
  getDay (day: number, recurringEvents: RecurringEvent[]): Event[] {
    const date = new ICAL.Time({
      year: this.year,
      month: this.month,
      day,
      isDate: true
    }, this.timezone)

    return this.data
      .concat(...recurringEvents.map(event => event(this)))
      .filter(event => event.affetcsDate(date, this.timezone))
  }

  /**
   * Returns an Array of plain JavaScript Objects to be returned in the REST API as JSON
   * @param day Number of day this method is called for
   * @param recur Array of RecurrentEvents
   */
  dayToJSONObject (day: number, recurringEvents: RecurringEvent[]): Object[] {
    return this.getDay(day, recurringEvents)
      .map(event => event.toJSONObject())
  }
}
