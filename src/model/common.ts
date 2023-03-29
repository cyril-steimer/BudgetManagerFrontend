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
    const dateObject = dayjs()
        .year(date.year)
        .month(date.month - 1) // month is zero-indexed in dayjs
        .date(date.day);
    return dateObject.format('YYYY-MM-DD');
}

export function dateStructfromISO8601String(string: string): DateStruct {
    const dateObject = dayjs(string);
    return {
        year: dateObject.year(),
        month: dateObject.month() + 1, // month is zero-indexed in dayjs
        day: dateObject.date()
    };
}
