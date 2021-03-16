import * as ICAL from 'ical.js'
import { AnyEvent, Event, RecurrentEvent } from './Event'

/**
 * Class Month
 * 
 * Month containing all Events in said month
 */
export default class Month {
    /** Private array of Events in Month */
    private _data: Set<Event> = new Set()

    /** Array of Events in Month */
    get data(): Event[] {
        return [...this._data]
    }

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
    constructor(year: number, month: number, data: Event[], timezone: ICAL.Timezone) {
        this.year = year
        this.month = month
        data.forEach(it => this._data.add(it))
        this.timezone = timezone

        this.firstVisible = new ICAL.Time({
            year: this.year,
            month: this.month,
            day: 1,
            isDate: true
        }, timezone).startOfWeek(ICAL.Time.MONDAY)

        this.lastVisible = new ICAL.Time({
            year: this.year,
            month: this.month,
            day: ICAL.Time.daysInMonth(this.month, this.year),
            isDate: true
        }, timezone).endOfWeek(ICAL.Time.MONDAY)
    }

    /**
     * Adds an Event to this Month
     * @param event Event to be added
     */
    addEvent (event: Event) {
        this._data.add(event)
    }

    /**
     * Returns an Array of plain JavaScript Objects to be returned in the REST API as JSON
     * @param recur Array of RecurrentEvents
     */
    toJSON (recur: RecurrentEvent[]): Object[] {
        return this.data
            .concat(...recur.map(r => r(this)))
            .map(e => e.toJSON())
    }

    /**
     * Returns an Array of all Events on the given day in this Month
     * @param day Number of day this method is called for
     * @param recur Array of RecurrentEvents
     */
    getDay (day: number, recur: RecurrentEvent[]): Event[] {
        const date = new ICAL.Time({
            year: this.year,
            month: this.month,
            day: day,
            isDate: true
        }, this.timezone)
        return this.data.concat(...recur.map(r => r(this)))
            .filter(e => this.affectsDate(e, date))
    }

    /**
     * Returns an Array of plain JavaScript Objects to be returned in the REST API as JSON
     * @param day Number of day this method is called for
     * @param recur Array of RecurrentEvents
     */
    dayToJSON (day: number, recur: RecurrentEvent[]): Object[] {
        return this.getDay(day, recur)
            .map(e => e.toJSON())
    }

    /**
     * Private method that checks whether an Event affects a certain date
     * @param event Event to be checked
     * @param date Date tp be checked for
     */
    private affectsDate (event: Event, date: ICAL.Time): boolean {
        return event.start.compareDateOnlyTz(date, this.timezone) <= 0 && event.end.compareDateOnlyTz(date, this.timezone) >= 0
    }

    /** Resets this Month to 0 entries */
    reset() {
        this._data.clear()
    }
}