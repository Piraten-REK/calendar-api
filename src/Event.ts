import { Time } from 'ical.js'
import Month from './Month'

export interface EventAsJson {
  title: string
  description: string
  location: string
  start: string
  end: string
}

/**
 * Class Event
 * Represents a single event
 */
export class Event {
  /** Event title */
  #title: string
  /** Event description */
  #description: string
  /** Event location */
  #location: string
  /** Event starting time */
  #start: Time
  /** Event ending time */
  #end: Time

  constructor (title: string, description: string, location: string, start: Time, end: Time) {
    this.#title = title
    this.#description = description
    this.#location = location
    this.#start = start
    this.#end = end
    if (this.#end.isDate) {
      this.#end.adjust(-1, 0, 0, 0)
    }
  }

  /** Event title */
  get title (): string { return this.#title }
  /** Event description */
  get description (): string { return this.#description }
  /** Event location */
  get location (): string { return this.#location }
  /** Event starting time */
  get start (): Time { return this.#start }
  /** Event ending time */
  get end (): Time { return this.#end }
  /** True if event is all day long */
  get wholeDay (): boolean {
    return this.#start.icaltype === 'date' && this.end.icaltype === 'date'
  }

  toJson (): EventAsJson {
    return {
      title: this.#title,
      description: this.#description,
      location: this.#description,
      start: this.#start.toString(),
      end: this.#end.toString()
    }
  }
}

/**
 * Type RecurringEvent
 * A recurring event
 * Factory of events
 */
export type RecurringEvent = (month: Month) => Event[]

/**
 * Type AnyEvent
 * Single or recurring Event
 */
// export type AnyEvent = Event | RecurringEvent
