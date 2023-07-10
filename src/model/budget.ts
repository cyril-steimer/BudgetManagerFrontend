import {Amount, NamedObject} from "./common";
import {Expense} from "./expense";

export interface BudgetInPeriod {
    category: NamedObject;
    amount: Amount;
}

export class BudgetInPeriodWithExpenses {
    constructor(readonly budget: BudgetInPeriod, readonly expenses: Expense[]) {
    }
}