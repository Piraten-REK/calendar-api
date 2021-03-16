import { Time } from 'ical.js'
import Month from './Month'

/** 
 * Class Event
 * 
 * Represents a single event
 */
export class Event {
  /** Event title */
  public readonly title: string
  /** Event description */
  public readonly description: string
  /** Event location */
  public readonly location: string
  /** Event start time */
  public readonly start: Time
  /** Event end time */
  public readonly end: Time
  /** True if event is all day long */
  get dayLong(): boolean {
    return this.start.icaltype === 'date' && this.end.icaltype === 'date'
  }

  /**
   * Constructor for Event
   * @param title Event title
   * @param description Event description
   * @param location Event location
   * @param start Event start time
   * @param end Event end time
   */
  constructor(title: string, description: string, location: string, start: Time, end: Time) {
    this.title = title
    this.description = description
    this.location = location
    this.start = start
    this.end = end
    if (this.end.isDate) this.end.adjust(-1, 0, 0, 0, 0)
  }

  /** Returns a plain JavaSCript Object for use in the REST-API as JSON */
  toJSON(): Object {
    return {
      title: this.title,
      description: this.description,
      location: this.location,
      start: this.start.toString(),
      end: this.end.toString()
    }
  }
}

/**
 * Type RecurrentEvent
 * 
 * A recurring event
 * Factory of Events
 */
export type RecurrentEvent = (month: Month) => Event[]

/**
 * Type AnyEvent
 * 
 * Single or recurring Event
 */
export type AnyEvent = Event|RecurrentEvent