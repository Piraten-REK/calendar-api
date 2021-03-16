import * as ICAL from 'ical.js'
import Month from './Month'
import { default as getNewData } from './ical'
import { Event, RecurrentEvent } from './Event'
import { setInterval } from 'timers'

/** Datahandler singleton */
export default new class DataHandler {
    /** Map of Months indexed by year and month */
    private data: Map<number, Map<number, Month>> = new Map()
    /** Array of all Recurrent Events in data source */
    private recur: RecurrentEvent[] = []
    /** Timezone for all data */
    private _timezone: ICAL.Timezone|null = null
    /** Timezone for all data */
    public get timezone(): ICAL.Timezone|null {
        return this._timezone ? new ICAL.Timezone(this._timezone.component) : null
    }

    /** Date on which the data was last updated */
    private _lastModified: Date = new Date(0)
    /** Date on which the data was last updated */
    public get lastModified(): Date {
        return new Date(this._lastModified)
    }

    constructor () {
        this.pullData()
        setInterval(() => this.pullData.call(this), 10 * 60 * 1e3)
    }

    /**
     * Retrieves new data from the data source
     */
    private pullData () {
        getNewData().then(({singleEvents, recurrentEvents, timezone}) => {
            for (const event of singleEvents) {
                for (const [year, month] of this.whichMonths(event)) {
                    if (!this.data.has(year)) this.data.set(year, new Map())
                    if (!this.data.get(year)!.has(month)) this.data.get(year)!.set(month, new Month(year, month, [], timezone))
                    this.data.get(year)!.get(month)!.addEvent(event)
                }
            }

            this.recur = recurrentEvents

            this._timezone = timezone
            this._lastModified = new Date()

            console.log('[%s] Data pulled', this._lastModified.toUTCString())
        }).catch(e => { console.error('[%s] Unable to fetch data\n', (new Date).toUTCString()); console.error(e) })
    }

    /**
     * Returns an Array of months the given Event affects as number tupels representing year and month
     * @param event The Event to check for
     */
    private whichMonths (event: Event): [number, number][] {
        if (event.start.year === event.end.year && event.start.month === event.end.month) return [[event.start.year, event.start.month]]

        const r = [
            [event.start.year, event.start.month] as [number, number],
            [event.end.year, event.end.month] as [number, number]
        ]
        
        for (let m = event.end.month - event.start.month + ((event.end.year - event.start.year) * 12); m > 1; m--) {
            r.push([(m + event.start.month - 2) % 12 + 1, Math.floor((m + event.start.month) / 12) + event.start.year] as [number, number])
        }

        if (event.start.weekNumber(ICAL.Time.MONDAY) === event.start.startOfMonth().weekNumber(ICAL.Time.MONDAY) && event.start.startOfWeek(ICAL.Time.MONDAY).dayOfWeek(ICAL.Time.MONDAY) !== ICAL.Time.MONDAY) {
            let m = event.start.month - 1
            let y = event.start.year
            if (m < 1) {
                m = 12
                y--
            }
            r.push([y, m] as [number, number])
        }

        if (event.end.weekNumber(ICAL.Time.MONDAY) === event.end.endOfMonth().weekNumber(ICAL.Time.MONDAY) && event.end.endOfWeek(ICAL.Time.MONDAY).dayOfWeek(ICAL.Time.MONDAY) !== ICAL.Time.SUNDAY) {
            let m = event.end.month
            let y = event.end.year
            if (m > 12) {
                m = 1
                y++
            }
            r.push([y, m] as [number, number])
        }

        return r.filter((val, id, self) => self.indexOf(val) === id)
    }

    /**
     * Returns an Array of all Events of the given month as plain JavaScript objects to be returned in the REST API as JSON
     * @param year Number of year
     * @param month Number of month
     */
    getMonth (year: number, month: number): Object {
        if (!this.data.has(year)) this.data.set(year, new Map())
        if (!this.data.get(year)!.has(month)) this.data.get(year)!.set(month, new Month(year, month, [], this._timezone!))
        return this.data.get(year)!.get(month)!.toJSON(this.recur)
    }

    /**
     * Returns an Array of all Events of the given day as plain JavaScript objects to be returned in the REST API as JSON
     * @param year Number of year
     * @param month Number of month
     * @param day Number of day
     */
    getDay (year: number, month: number, day: number): Object {
        if (!this.data.has(year)) this.data.set(year, new Map())
        if (!this.data.get(year)!.has(month)) this.data.get(year)!.set(month, new Month(year, month, [], this._timezone!))
        return this.data.get(year)!.get(month)!.dayToJSON(day, this.recur)
    }
}()