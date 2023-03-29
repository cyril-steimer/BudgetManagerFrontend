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
