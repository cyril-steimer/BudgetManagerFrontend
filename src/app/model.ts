import {BudgetPeriod} from './budget.period';

export interface Expense {
    id: string;
    name: Name;
    amount: Amount;
    budget?: Budget;
    method: PaymentMethod;
    author: Author;
    tags: Tag[];
}

export type ExpenseTemplate = Expense;

export interface ActualExpense extends Expense {
    date: Timestamp;
}

export interface ScheduledExpense extends Expense {
    startDate: Timestamp;
    endDate: Timestamp;
    schedule: WeeklySchedule | MonthlySchedule;
}

export interface Budget {
    id: string;
    category: Category;
    amounts: BudgetAmount[];
}

export interface BudgetAmount {
    amount: Amount;
    period: BudgetPeriod;
    from: MonthYear;
    to: MonthYear;
}

export interface MonthYear {
    month: number;
    year: number;
}

export interface MonthYearPeriod {
    from: MonthYear;
    to: MonthYear;
}

export interface BudgetInPeriod {
    budget: Budget;
    amount: Amount;
}

export interface CategoryExpenses {
    budgetId?: string;
    category: Category;
    amount: Amount;
    budget: Amount;
    expenses: ActualExpense[];
}

export interface PaymentMethod {
    name: string;
}

export interface Tag {
    name: string;
}

export interface Author {
    name: string;
}

export interface Amount {
    amount: number;
}

export interface Name {
    name: string;
}

export interface Category {
    name: string;
}

export interface Timestamp {
    year: number;
    month: number;
    day: number;
}

export interface SubList<T> {
    count: number;
    values: T[];
}

export interface Pagination {
    from: number;
    count: number;
}

export interface Sort {
    field: string;
    direction: string;
}

export interface WeeklySchedule {
    dayOfWeek: string;
}

export interface MonthlySchedule {
    dayOfMonth: number;
}
