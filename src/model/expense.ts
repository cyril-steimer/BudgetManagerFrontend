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

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface WeeklySchedule {
    dayOfWeek: DayOfWeek;
}

export interface MonthlySchedule {
    dayOfMonth: number;
}

export type Schedule = WeeklySchedule | MonthlySchedule;

export interface ScheduledExpense extends BaseExpense {
    startDate: DateStruct;
    endDate?: DateStruct;
    schedule: Schedule;
}

export function isMonthlySchedule(schedule: Schedule): schedule is MonthlySchedule {
    return schedule.hasOwnProperty('dayOfMonth');
}

export function isWeeklySchedule(schedule: Schedule): schedule is WeeklySchedule {
    return !isMonthlySchedule(schedule);
}

export function scheduleToString(schedule: Schedule): string {
    if (isMonthlySchedule(schedule)) {
        // TODO Ordinal (e.g. 1st, 2nd)
        return `Monthly on the ${schedule.dayOfMonth}`;
    } else if (isWeeklySchedule(schedule)) {
        // TODO Convert to pretty weekday (e.g. 'Monday')
        return `Weekly on ${schedule.dayOfWeek}`;
    }
    throw new Error(`Unsupported schedule: ${JSON.stringify(schedule)}`);
}

export function allWeeklySchedules(): WeeklySchedule[] {
    const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    return days.map(day => {
        return {
            dayOfWeek: day
        }
    });
}

export function allMonthlySchedules(): MonthlySchedule[] {
    const result: MonthlySchedule[] = [];
    for (let i = 1; i <= 31; i++) {
        result.push({
            dayOfMonth: i
        });
    }
    return result;
}

export function allSchedules(): Schedule[] {
    const result: Schedule[] = [];
    result.push(...allWeeklySchedules());
    result.push(...allMonthlySchedules());
    return result;
}

export function sumExpenses(expenses: Expense[]): number {
    return sumAmount(expenses.map(exp => exp.amount));
}

export function sumAmount(amounts: Amount[]): number {
    return sumValues(amounts.map(amt => amt.amount));
}

export function sumValues(values: number[]): number {
    return values.reduce((total, value) => total + value, 0);
}