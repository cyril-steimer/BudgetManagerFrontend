import {Amount, DateStruct, NamedObject} from './common';

export interface Expense {
    id: string;
    name: NamedObject;
    amount: Amount;
    category: NamedObject;
    date: DateStruct;
    method: NamedObject;
    author: NamedObject;
    tags: NamedObject[];
}

export function sumAmount(expenses: Expense[]): number {
    return expenses.reduce((total, expense) => total + expense.amount.amount, 0);
}
