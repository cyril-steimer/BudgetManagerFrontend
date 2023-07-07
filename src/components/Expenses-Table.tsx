import {BaseExpense, Expense, ExpenseTemplate, ScheduledExpense, scheduleToString, sumAmount} from '../model/expense';
import DataTable, {ColumnSettings, ColumnSettingsInterface} from './Data-Table';
import {compareDateStruct, dateStructToISO8601String, NamedObject} from '../model/common';
import {Chip} from '@mui/material';
import {useContext} from 'react';
import {CurrencyContext} from '../context/contexts';
import {Link, useNavigate} from 'react-router-dom';
import {useIsNavigating} from '../hooks/hooks';

function baseExpenseColumnSettings<K extends keyof BaseExpense>(key: K, settings: ColumnSettingsInterface<BaseExpense, K>): ColumnSettings<BaseExpense> {
    return ColumnSettings.of(key, settings);
}

function expenseColumnSettings<K extends keyof Expense>(key: K, settings: ColumnSettingsInterface<Expense, K>): ColumnSettings<Expense> {
    return ColumnSettings.of(key, settings);
}

function scheduledExpenseColumnSettings<K extends keyof ScheduledExpense>(key: K, settings: ColumnSettingsInterface<ScheduledExpense, K>): ColumnSettings<ScheduledExpense> {
    return ColumnSettings.of(key, settings);
}

function filterNamedObject(value: NamedObject, filter: string): boolean {
    return value.name.toLowerCase().includes(filter.toLowerCase());
}

function compareNamedObject(a: NamedObject, b: NamedObject): number {
    return a.name.localeCompare(b.name);
}

export interface ExpensesTableParameters<E extends BaseExpense> {
    expenses: E[];
    filter?: string;
}

const name = baseExpenseColumnSettings('name', {
    name: 'Name',
    render: value => value.name,
    filter: filterNamedObject,
    compare: compareNamedObject
});

const amount = baseExpenseColumnSettings('amount', {
    name: 'Amount',
    render: value => (
        <CurrencyCell value={value.amount}></CurrencyCell>
    ),
    compare: (a, b) => a.amount - b.amount
});

const category = baseExpenseColumnSettings('category', {
    name: 'Category',
    render: value => (
        <FilterCell field='category' value={value?.name ?? ''}></FilterCell> 
    ),
    filter: filterNamedObject,
    compare: compareNamedObject
});

const method = baseExpenseColumnSettings('method', {
    name: 'Method',
    render: value => (
        <FilterCell field='method' value={value.name ?? ''}></FilterCell>
    ),
    filter: filterNamedObject,
    compare: compareNamedObject
});

const author = baseExpenseColumnSettings('author', {
    name: 'Author',
    render: value => (
        <FilterCell field='author' value={value.name ?? ''}></FilterCell>
    ),
    filter: filterNamedObject,
    compare: compareNamedObject
});

const tags = baseExpenseColumnSettings('tags', {
    name: 'Tags',
    render: value => (
        <div>
            {value.map(tag => <TagChip tag={tag.name}/>)}
        </div>
    ),
    filter: (value, filter) => value.find(v => filterNamedObject(v, filter)) !== undefined
});

function filterFieldQueryUrl(field: string, value: string) {
    return `/expenses/field/${field}/${encodeURIComponent(value)}`;
}

function CurrencyCell({value}: {value: number}) {
    const currency = useContext(CurrencyContext);
    return <span>{value.toFixed(2)} {currency}</span>;
}

function FilterCell({field, value}: {field: string, value: string}) {
    const isNavigating = useIsNavigating();
    if (isNavigating) {
        return <span>{value}</span>;
    }
    return <Link to={filterFieldQueryUrl(field, value)} >{value}</Link>;
}

function TagChip({tag}: {tag: string}) {
    const navigate = useNavigate();
    return <Chip
        label={tag}
        key={tag}
        onClick={() => navigate(filterFieldQueryUrl('tag', tag))}
        color='primary'
        variant='outlined'
        disabled={useIsNavigating()}
    />;
}

export function ScheduledExpensesTable({expenses, filter}: ExpensesTableParameters<ScheduledExpense>) {
    const start = scheduledExpenseColumnSettings('startDate', {
        name: 'Start Date',
        render: dateStructToISO8601String,
        compare: compareDateStruct
    });
    const end = scheduledExpenseColumnSettings('endDate', {
        name: 'End Date',
        render: dateStructToISO8601String,
        compare: compareDateStruct
    });
    const schedule = scheduledExpenseColumnSettings('schedule', {
        name: 'Schedule',
        render: scheduleToString
    });

    const columns = [name, amount, category, start, end, schedule, method, author, tags];

    return <DataTable
        values={expenses}
        columns={columns}
        filter={filter}
        initialSortColumn={name}
    />;
}

export function ExpenseTemplatesTable({expenses, filter}: ExpensesTableParameters<ExpenseTemplate>) {
    const columns = [name, amount, category, method, author, tags];

    return <DataTable
        values={expenses}
        columns={columns}
        filter={filter}
        initialSortColumn={name}
    />;
}

export function ExpensesTable({expenses, filter}: ExpensesTableParameters<Expense>) {
    const date = expenseColumnSettings('date', {
        name: 'Date',
        render: dateStructToISO8601String,
        compare: compareDateStruct
    });

    const columns = [name, amount, category, date, method, author, tags];

    return <DataTable
        values={expenses}
        columns={columns}
        filter={filter}
        initialSortColumn={date}
        computeTotal={sumAmount}
        renderTotal={value => (<CurrencyCell value={value}></CurrencyCell>)}
    />;
}
