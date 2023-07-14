import {Amount, MonthYear, NamedObject} from "./common";
import {Expense} from "./expense";

export interface BudgetInPeriod {
    category: NamedObject;
    amount: Amount;
}

export class BudgetInPeriodWithExpenses {
    constructor(readonly budget: BudgetInPeriod, readonly expenses: Expense[], readonly isReal: boolean) {
    }
}

export type BudgetAmountPeriod = 'monthly' | 'yearly';

export interface BudgetAmount {
    amount: Amount;
    period: BudgetAmountPeriod,
    from: MonthYear;
    to: MonthYear;
}

export interface Budget {
    category: NamedObject;
    amounts: BudgetAmount[];
}