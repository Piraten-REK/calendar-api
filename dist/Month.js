import ICAL from 'ical.js';
/**
 * @class Month
 *
 * Month containig all Events in said month
 *
 * @since 1.0.0
 */
export default class Month {
    /** Private set of Events in Month */
    #data;
    /** Timezone for this Month and all contained Events */
    timezone;
    /** Year of this Month */
    year;
    /**
     * Number of this Month
     * where 1 is Januaray and 12 is December
     */
    month;
    /**
     * First visible day on a calendar page
     * may be day of previous Month
     */
    firstVisible;
    /**
     * Last visible day on a calendar page
     * may be day of prepending Month
     */
    lastVisible;
    /**
     * Constructor for Month
     * @param year Year of this Month
     * @param month Number of this Month where 1 is Januaray and 12 is December
     * @param data Single Events in this month
     * @param timezone Timezone for this Month and all contained Events
     */
    constructor(year, month, data, timezone) {
        this.year = year;
        this.month = month;
        this.#data = new Set(data);
        this.timezone = timezone;
        this.firstVisible = new ICAL.Time({
            year: this.year,
            month: this.month,
            day: 1,
            isDate: true
        }, timezone).startOfWeek(ICAL.Time.MONDAY);
        this.lastVisible = this.firstVisible.clone();
        this.lastVisible.addDuration(new ICAL.Duration({
            weeks: 5,
            days: 6,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isNegative: false
        }));
    }
    /** Array of Events in Month */
    get data() {
        return Array.from(this.#data);
    }
    /**
     * Adds an Event to this Month
     * @param event Event to be added
     */
    addEvent(event) {
        this.#data.add(event);
    }
    /**
     * Returns an Array of plain JavaScript Objects to be returned in the REST API as JSON
     * @param recurringEvents Array of RecurrentEvents
     */
    toJSONObject(recurringEvents) {
        return this.data
            .concat(...recurringEvents.map(event => event(this)))
            .map(event => event.toJSONObject());
    }
    /**
     * Returns an Array of all Events on the given day in this Month
     * @param day Number of day this method is called for
     * @param recur Array of RecurrentEvents
     */
    getDay(day, recurringEvents) {
        const date = new ICAL.Time({
            year: this.year,
            month: this.month,
            day,
            isDate: true
        }, this.timezone);
        return this.data
            .concat(...recurringEvents.map(event => event(this)))
            .filter(event => event.affetcsDate(date, this.timezone));
    }
    /**
     * Returns an Array of plain JavaScript Objects to be returned in the REST API as JSON
     * @param day Number of day this method is called for
     * @param recur Array of RecurrentEvents
     */
    dayToJSONObject(day, recurringEvents) {
        return this.getDay(day, recurringEvents)
            .map(event => event.toJSONObject());
    }
}
