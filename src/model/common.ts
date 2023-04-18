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

export function dateStructToISO8601String(date: DateStruct): string {
    const dateObject = dateStructToDayJsObject(date);
    return dateObject.format('YYYY-MM-DD');
}

export function dateStructToDayJsObject(date: DateStruct): dayjs.Dayjs {
    // month is zero-indexed in JavaScript
    const jsDate = new Date(date.year, date.month - 1, date.day);
    return dayjs(jsDate);
}

export function dateStructFromISO8601String(string: string): DateStruct {
    const dateObject = dayjs(string);
    return {
        year: dateObject.year(),
        month: dateObject.month() + 1, // month is zero-indexed in dayjs
        day: dateObject.date()
    };
}

export function compareDateStruct(a: DateStruct, b: DateStruct): number {
    return dateStructToDayJsObject(a).valueOf() - dateStructToDayJsObject(b).valueOf();
}
