import dayjs from 'dayjs';

export interface NamedObject {
    name: string;
}

export interface Amount {
    amount: number;
}

export interface DateStruct {
    day: number;
    month: number;
    year: number;
}

export function dateStructToISO8601String(date: DateStruct | undefined): string {
    if (date === undefined) {
        return '-';
    }
    const dateObject = dateStructToDayJsObject(date);
    return dateObject.format('YYYY-MM-DD');
}

export function dateStructToDayJsObject(date: DateStruct): dayjs.Dayjs;
export function dateStructToDayJsObject(date: DateStruct | undefined): dayjs.Dayjs | undefined;
export function dateStructToDayJsObject(date: DateStruct | undefined): dayjs.Dayjs | undefined {
    if (date === undefined) {
        return undefined;
    }
     // Months in the Backend are 1-based
    const jsDate = new Date(date.year, date.month - 1, date.day);
    return dayjs(jsDate);
}

export function dayJsObjectToDateStruct(date: dayjs.Dayjs): DateStruct;
export function dayJsObjectToDateStruct(date: dayjs.Dayjs | undefined): DateStruct | undefined;
export function dayJsObjectToDateStruct(date: dayjs.Dayjs | undefined): DateStruct | undefined {
    if (date === undefined) {
        return undefined;
    }
    return {
        day: date.date(),
        month: date.month() + 1, // Months in the Backend are 1-based
        year: date.year()
    };
}

export function dateStructFromISO8601String(string: string): DateStruct {
    const dateObject = dayjs(string);
    // Months in the Backend are 1-based
    return {
        year: dateObject.year(),
        month: dateObject.month() + 1,
        day: dateObject.date()
    };
}

export function dateStructNow(): DateStruct {
    return dayJsObjectToDateStruct(dayjs());
}

export const JANUARY = 0;
export const DECEMBER = 11;

export function compareDateStruct(a: DateStruct | undefined, b: DateStruct | undefined): number {
    if (a === undefined && b === undefined) {
        return 0;
    } else if (a === undefined) {
        return -1;
    } else if (b === undefined) {
        return 1;
    }
    return dateStructToDayJsObject(a).valueOf() - dateStructToDayJsObject(b).valueOf();
}

export function compareAmount(a: Amount, b: Amount): number {
    return compareNumber(a.amount, b.amount);
}

export function compareNumber(a: number, b: number): number {
    return a - b;
}

export function compareNamedObject(a: NamedObject, b: NamedObject): number {
    return compareString(a.name, b.name);
}

export function compareString(a: string, b: string): number {
    return a.localeCompare(b);
}