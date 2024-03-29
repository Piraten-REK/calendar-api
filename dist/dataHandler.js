import ICAL from 'ical.js';
import Month from './Month.js';
import getNewData from './ical.js';
class DataHandler {
    /** Map of Months indexed by year and month */
    #data = new Map();
    /** Array of all Recurrent Events in data source */
    #recurringEvents = [];
    /** Timezone for all data */
    // @ts-expect-error
    #timezone = null;
    /** Date on which the data was last updated */
    // @ts-expect-error
    #lastModified = null;
    constructor() {
        void this.#update();
        this.#update.bind(this);
        setInterval(() => {
            void this.#update();
        }, 10 * 60 * 1000);
    }
    /** Timezone for all data */
    get timezone() {
        return this.#timezone;
    }
    /** Date on which the data was last updated */
    get lastModified() {
        return new Date(this.#lastModified);
    }
    /**
     * Retrieves new data from the data source
     */
    async #update() {
        await getNewData()
            .then(({ singleEvents, recurringEvents, timezone }) => {
            this.#data = new Map();
            for (const event of singleEvents) {
                for (const [year, month] of this.#whichMonths(event)) {
                    if (!this.#data.has(year)) {
                        this.#data.set(year, new Map());
                    }
                    if (!this.#data.get(year).has(month)) {
                        this.#data.get(year).set(month, new Month(year, month, [], timezone));
                    }
                    this.#data.get(year).get(month).addEvent(event);
                }
            }
            this.#recurringEvents = recurringEvents;
            this.#timezone = timezone;
            this.#lastModified = new Date();
        })
            .catch(error => {
            console.error('[%s] Unable to fetch data\n', (new Date()).toUTCString());
            console.error(error);
        });
    }
    /**
     * Returns an Array of months the given Event affects as number tupels representing year and month
     * @param event The Event to check for
     */
    #whichMonths(event) {
        if (event.start.year === event.end.year &&
            event.start.month === event.end.month) {
            return [
                [event.start.year, event.start.month]
            ];
        }
        const arr = [
            [event.start.year, event.start.month],
            [event.end.year, event.end.month]
        ];
        for (let month = event.end.month - event.start.month + ((event.end.year - event.start.year) * 12); month > 1; month--) {
            arr.push([
                (month + event.start.month - 2) % 12 + 1,
                Math.floor((month + event.start.month) / 12) + event.start.year
            ]);
        }
        if (event.start.weekNumber(ICAL.Time.MONDAY) === event.start.startOfMonth().weekNumber(ICAL.Time.MONDAY) &&
            event.start.startOfWeek(ICAL.Time.MONDAY).dayOfWeek(ICAL.Time.MONDAY) !== ICAL.Time.MONDAY) {
            let month = event.start.month - 1;
            let year = event.start.year;
            if (month < 1) {
                month = 12;
                year--;
            }
            arr.push([year, month]);
        }
        if (event.end.weekNumber(ICAL.Time.MONDAY) === event.end.endOfMonth().weekNumber(ICAL.Time.MONDAY) &&
            event.end.endOfWeek(ICAL.Time.MONDAY).dayOfWeek(ICAL.Time.MONDAY) !== ICAL.Time.SUNDAY) {
            let month = event.end.month;
            let year = event.end.year;
            if (month > 12) {
                month = 1;
                year++;
            }
            arr.push([year, month]);
        }
        return arr.filter((val, idx, self) => self.findIndex(val2 => val[0] === val2[0] && val[1] === val2[1]) === idx);
    }
    /**
     * Returns an Array of all Events of the given month as plain JavaScript objects to be returned in the REST API as JSON
     * @param year Number of year
     * @param month Number of month
     */
    getMonth(year, month) {
        if (!this.#data.has(year)) {
            this.#data.set(year, new Map());
        }
        if (!this.#data.get(year).has(month)) {
            this.#data.get(year).set(month, new Month(year, month, [], this.#timezone));
        }
        return this.#data.get(year).get(month).toJSONObject(this.#recurringEvents);
    }
    /**
     * Returns an Array of all Events of the given day as plain JavaScript objects to be returned in the REST API as JSON
     * @param year Number of year
     * @param month Number of month
     * @param day Number of day
     */
    getDay(year, month, day) {
        if (!this.#data.has(year)) {
            this.#data.set(year, new Map());
        }
        if (!this.#data.get(year).has(month)) {
            this.#data.get(year).set(month, new Month(year, month, [], this.#timezone));
        }
        return this.#data.get(year).get(month).dayToJSONObject(day, this.#recurringEvents);
    }
}
const dataHandlerSingleton = new DataHandler();
export default dataHandlerSingleton;
