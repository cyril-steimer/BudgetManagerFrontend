import {Amount, DateStruct, NamedObject} from './common';

export interface BaseExpense {
    id: string;
    name: NamedObject;
    amount: Amount;
    category: NamedObject;
    method: NamedObject;
    author: NamedObject;
    tags: NamedObject[];

}

export interface Expense extends BaseExpense {
    date: DateStruct;
}

export interface ExpenseTemplate extends BaseExpense {
    // No additional features
}

export interface WeeklySchedule {
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
}

export interface MonthlySchedule {
    dayOfMonth: number;
}

export interface ScheduledExpense extends Expense {
    startDate: DateStruct;
    endDate?: DateStruct;
    schedule: WeeklySchedule | MonthlySchedule;
}

export function scheduleToString(schedule: WeeklySchedule | MonthlySchedule): string {
    if (schedule.hasOwnProperty('dayOfMonth')) {
        const monthly = schedule as MonthlySchedule;
        // TODO Ordinal (e.g. 1st, 2nd)
        return `Monthly on the ${monthly.dayOfMonth}`;
    }
    const weekly = schedule as WeeklySchedule;
    // TODO Convert to pretty weekday (e.g. 'Monday')
    return `Weekly on ${weekly.dayOfWeek}`;
}

export function sumAmount(expenses: Expense[]): number {
    return expenses.reduce((total, expense) => total + expense.amount.amount, 0);
}
