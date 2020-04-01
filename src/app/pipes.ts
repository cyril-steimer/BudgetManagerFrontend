import {Pipe, PipeTransform} from '@angular/core';

/**
 * Convert a number to an ordinal number. E.g. 1 -> 1st, 2 -> 2nd, etc.
 */
@Pipe({name: 'ordinal'})
export class OrdinalPipe implements PipeTransform {

    transform(value: number): string {
        let suffixTen = value % 10;
        let suffixHundred = value % 100;
        if (suffixTen == 1 && suffixHundred != 11) {
            return `${value}st`;
        } else if (suffixTen == 2 && suffixHundred != 12) {
            return `${value}nd`;
        } else if (suffixTen == 3 && suffixHundred != 13) {
            return `${value}rd`;
        }
        return `${value}th`;
    }
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Convert a number to a weekday. E.g. 1 -> Monday, ..., 7 -> Sunday.
 */
@Pipe({name: 'weekday'})
export class WeekdayPipe implements PipeTransform {

    transform(value: number): string {
        let index = value - 1;
        if (index < 0 || index >= WEEKDAYS.length) {
            return `Invalid weekday (${value})`;
        }
        return WEEKDAYS[index];
    }
}
