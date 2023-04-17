import {Expense, sumAmount} from '../model/expense';
import DataTable, {ColumnSettings, ColumnSettingsInterface} from './Data-Table';
import {dateStructToDayJsObject, dateStructToISO8601String, NamedObject} from '../model/common';

function expenseColumnSettings<K extends keyof Expense>(key: K, settings: ColumnSettingsInterface<Expense, K>): ColumnSettings<Expense> {
    return ColumnSettings.of(key, settings);
}

function filterNamedObject(value: NamedObject, filter: string): boolean {
    return value.name.toLowerCase().includes(filter.toLowerCase());
}

function compareNamedObject(a: NamedObject, b: NamedObject): number {
    return a.name.localeCompare(b.name);
}

export interface ExpensesTableParameters {
    expenses: Expense[];
    filter?: string;
}

export default function ExpensesTable({expenses, filter}: ExpensesTableParameters) {
    const name = expenseColumnSettings('name', {
        name: 'Name',
        render: value => value.name,
        filter: filterNamedObject,
        compare: compareNamedObject
    });
    const amount = expenseColumnSettings('amount', {
        name: 'Amount',
        render: value => value.amount.toString(),
        compare: (a, b) => a.amount - b.amount
    });
    const category = expenseColumnSettings('category', {
        name: 'Category',
        render: value => value.name,
        filter: filterNamedObject,
        compare: compareNamedObject
    });
    const date = expenseColumnSettings('date', {
        name: 'Date',
        render: value => dateStructToISO8601String(value),
        compare: (a, b) => dateStructToDayJsObject(a).valueOf() - dateStructToDayJsObject(b).valueOf()
    });
    const method = expenseColumnSettings('method', {
        name: 'Method',
        render: value => value.name,
        filter: filterNamedObject,
        compare: compareNamedObject
    });
    const author = expenseColumnSettings('author', {
        name: 'Author',
        render: value => value.name,
        filter: filterNamedObject,
        compare: compareNamedObject
    });
    const tags = expenseColumnSettings('tags', {
        name: 'Tags',
        render: value => value.map(v => v.name).join(', '),
        filter: (value, filter) => value.find(v => filterNamedObject(v, filter)) !== undefined
    });

    const columns = [name, amount, category, date, method, author, tags]

    return <DataTable
        values={expenses}
        columns={columns}
        filter={filter}
        initialSortColumn={date}
        computeTotal={sumAmount}
    />;
}
