import * as ICAL from 'ical.js'
import Month from './Month'
import { default as getNewData, subtractDates } from './ical'
import { Event, RecurrentEvent } from './Event'
import { setInterval } from 'timers'

export default new class DataHandler {
    private data: Map<number, Map<number, Month>> = new Map()
    private recur: RecurrentEvent[] = []

    private _timezone: ICAL.Timezone|null = null
    public get timezone(): ICAL.Timezone|null {
        return this._timezone ? new ICAL.Timezone(this._timezone.component) : null
    }

    private _lastModified: Date = new Date(0)
    public get lastModified(): Date {
        return new Date(this._lastModified)
    }

    constructor () {
        this.pullData()
        setInterval(this.pullData, 10 * 60 * 1e3, this)
    }

    private pullData (that: DataHandler = this) {
        getNewData()
            .then(data => {
                that._timezone = data.timezone

                const recur = []

                for (const event of data.events) {
                    if (typeof event === 'object') {
                        that.whichMonths(event).forEach(month => {
                            if (!that.data.has(month[0])) that.data.set(month[0], new Map())
                            if (!that.data.get(month[0])!.has(month[1])) that.data.get(month[0])!.set(month[1], new Month(month[0], month[1], [], that._timezone!))
                            else that.data.get(month[0])!.get(month[1])!.reset()
                            that.data.get(month[0])!.get(month[1])!.addEvent(event)
                        })
                    } else {
                        recur.push(event)
                    }
                }

                that.recur = recur

                that._lastModified = new Date()
                console.log('[%s] Data pulled', that._lastModified.toUTCString())
            })
            .catch(e => { console.error('[%s] Unable to fetch data\n', (new Date).toUTCString()); console.log(e) })
        
    }

    private whichMonths (event: Event): [number, number][] {
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

        return r
    }

    getMonth (year: number, month: number): Object {
        if (!this.data.has(year)) this.data.set(year, new Map())
        if (!this.data.get(year)!.has(month)) this.data.get(year)!.set(month, new Month(year, month, [], this._timezone!))
        return this.data.get(year)!.get(month)!.toJSON(this.recur)
    }

    getDay (year: number, month: number, day: number): Object {
        if (!this.data.has(year)) this.data.set(year, new Map())
        if (!this.data.get(year)!.has(month)) this.data.get(year)!.set(month, new Month(year, month, [], this._timezone!))
        return this.data.get(year)!.get(month)!.dayToJSON(day, this.recur)
    }
}()