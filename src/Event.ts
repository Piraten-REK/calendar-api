import ICAL from 'ical.js'
import type Month from './Month.js'

/**
 * @class Event
 * Represents a single event
 *
 * @since 1.0.0
 */
export default class Event {
  /** Event title */
  public readonly title: string
  /** Event description */
  public readonly description: string
  /** Event location */
  public readonly location: string
  /** Event start time */
  public readonly start: ICAL.Time
  /** Event end time */
  public readonly end: ICAL.Time

  constructor (title: string, description: string, location: string, start: ICAL.Time, end: ICAL.Time) {
    this.title = title
    this.description = description
    this.location = location
    this.start = start
    this.end = end
    if (this.end.isDate) {
      this.end.adjust(-1, 0, 0, 0, 0)
    }
  }

  /** True if event is all day long */
  get dayLong (): boolean {
    return this.start.icaltype === 'date' &&
      this.end.icaltype === 'date'
  }

  toJSONObject (): Record<'title' | 'description' | 'location' | 'start' | 'end', string> {
    return {
      title: this.title,
      description: this.description,
      location: this.location,
      start: this.start.toString(),
      end: this.end.toString()
    }
  }

  /**
   * Checks whether the Event affects a given date.
   * @param date Date to be checked for
   * @param timezone Timezone to be cheked in
   *
   * @since 2.0.0
   */
  affetcsDate (date: ICAL.Time, timezone: ICAL.Timezone): boolean {
    return this.start.compareDateOnlyTz(date, timezone) <= 0 &&
      this.end.compareDateOnlyTz(date, timezone) >= 0
  }
}

/**
 * A recurring event
 * Factory of {@link Event Events}
 */
export type RecurringEvent = (month: Month) => Event[]

export type AnyEvent = Event | RecurringEvent
