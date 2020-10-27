import * as ICAL from 'ical.js'
import { AnyEvent, Event, RecurrentEvent } from './Event'

export default class Month {
    private _data: Event[]

    get data(): Event[] {
        return [...this._data]
    }

    public readonly timezone: ICAL.Timezone

    public readonly year: number

    public readonly month: number

    public readonly firstVisible: ICAL.Time

    public readonly lastVisible: ICAL.Time

    constructor(year: number, month: number, data: Event[], timezone: ICAL.Timezone) {
        this.year = year
        this.month = month
        this._data = data
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

    addEvent (event: Event) {
        this._data.push(event)
    }

    toJSON (recur: RecurrentEvent[]): Object[] {
        return this.data
            .concat(...recur.map(r => r(this)))
            .map(e => e.toJSON())
    }

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

    dayToJSON (day: number, recur: RecurrentEvent[]): Object[] {
        return this.getDay(day, recur)
            .map(e => e.toJSON())
    }

    private affectsDate (event: Event, date: ICAL.Time): boolean {
        return event.start.compareDateOnlyTz(date, this.timezone) <= 0 && event.end.compareDateOnlyTz(date, this.timezone) >= 0
    }

    reset() {
        this._data = []
    }
}