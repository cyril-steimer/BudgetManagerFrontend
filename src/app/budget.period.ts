import {MonthYearPeriod} from './model';
import {DateUtil} from './model.util';

export enum BudgetPeriod {
    MONTHLY = 'monthly',
    YEARLY = 'yearly'
}

export interface BudgetPeriodSwitch<A, R> {

    caseMonthly(arg: A): R;

    caseYearly(arg: A): R;
}

export class BudgetPeriodSwitcher {
    constructor(private period: BudgetPeriod) {
    }

    switch<A, R>(mySwitch: BudgetPeriodSwitch<A, R>, arg: A): R {
        if (this.period === BudgetPeriod.MONTHLY) {
            return mySwitch.caseMonthly(arg);
        } else if (this.period === BudgetPeriod.YEARLY) {
            return mySwitch.caseYearly(arg);
        }
        throw Error('The budget period \'' + this.period + '\' is invalid');
    }

    getPeriod() {
        return this.period;
    }
}

export class MonthYearPeriodCalculator implements BudgetPeriodSwitch<Date, MonthYearPeriod> {

    caseMonthly(arg: Date): MonthYearPeriod {
        const month = arg.getMonth() + 1;
        const year = arg.getFullYear();
        return {
            from: {
                month: month,
                year: year
            },
            to: {
                month: month,
                year: year
            }
        };
    }

    caseYearly(arg: Date): MonthYearPeriod {
        const year = arg.getFullYear();
        return {
            from: {
                month: 1,
                year: year
            },
            to: {
                month: 12,
                year: year
            }
        };
    }
}

export class DaysInPeriod implements BudgetPeriodSwitch<Date, number> {

    caseMonthly(arg: Date): number {
        // https://stackoverflow.com/a/1184359
        return new Date(arg.getFullYear(), arg.getMonth() + 1, 0).getDate();
    }

    caseYearly(arg: Date): number {
        // https://stackoverflow.com/a/8619946
        const startCurrentYear = new Date(arg.getFullYear(), 0);
        const startNextYear = new Date(arg.getFullYear() + 1, 0);
        return daysBetween(startCurrentYear, startNextYear);
    }
}

export class DaysSinceStart implements BudgetPeriodSwitch<Date, number> {

    // Careful: We must make sure to count the current day in both cases.
    caseMonthly(arg: Date): number {
        return arg.getDate();
    }

    caseYearly(arg: Date): number {
        const startCurrentYear = new Date(arg.getFullYear(), 0);
        const argDay = new Date(arg.getFullYear(), arg.getMonth(), arg.getDate() + 1);
        return daysBetween(startCurrentYear, argDay);
    }
}

export class NextPeriod implements BudgetPeriodSwitch<Date, Date> {

    caseMonthly(arg: Date): Date {
        return DateUtil.startOfNextMonth(arg);
    }

    caseYearly(arg: Date): Date {
        return DateUtil.startOfNextYear(arg);
    }
}

export class PreviousPeriod implements BudgetPeriodSwitch<Date, Date> {

    caseMonthly(arg: Date): Date {
        return DateUtil.startOfPreviousMonth(arg);
    }

    caseYearly(arg: Date): Date {
        return DateUtil.startOfPreviousYear(arg);
    }
}

export class EndOfPeriod implements BudgetPeriodSwitch<Date, Date> {

    caseMonthly(arg: Date): Date {
        // https://stackoverflow.com/a/1184359
        return new Date(arg.getFullYear(), arg.getMonth() + 1, 0);
    }

    caseYearly(arg: Date): Date {
        return new Date(arg.getFullYear() + 1, 0, 0);
    }
}

export function isInPeriod(switcher: BudgetPeriodSwitcher, periodStart: Date, date: Date) {
    let end = switcher.switch(new EndOfPeriod(), periodStart);
    end = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
    return periodStart.getTime() <= date.getTime()
        && date.getTime() < end.getTime();
}

function daysBetween(start: Date, end: Date) {
    // https://stackoverflow.com/a/543152
    const day = 1000 * 60 * 60 * 24;
    return Math.round((end.getTime() - start.getTime()) / day);
}
