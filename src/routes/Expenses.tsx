import {LoaderFunctionArgs, Params, useLoaderData, useParams} from 'react-router-dom';
import {BaseExpense, Expense, ExpenseTemplate, ScheduledExpense} from '../model/expense';
import dayjs, {Dayjs} from 'dayjs';
import {ListResponse} from '../model/responses';
import {useState} from 'react';
import {TextField, Typography} from '@mui/material';
import {ExpensesTable, ExpenseTemplatesTable, ScheduledExpensesTable} from '../components/Expenses-Table';

function dateRangeQuery(fromInclusive: Dayjs, toExclusive: Dayjs): object {
    return {
        and: [
            {
                date: {
                    date: {
                        year: fromInclusive.year(),
                        month: fromInclusive.month() + 1,
                        day: fromInclusive.date()
                    },
                    comparison: '>='
                }
            },
            {
                date: {
                    date: {
                        year: toExclusive.year(),
                        month: toExclusive.month() + 1,
                        day: toExclusive.date()
                    },
                    comparison: '<'
                }
            }
        ]
    };
}

async function searchExpenses(query: object): Promise<ListResponse<Expense>> {
    const url = '/api/v1/expenses/search?sort=date&dir=desc';
    const response = await fetch(url, {
        method: 'post',
        body: JSON.stringify(query)
    });
    // TODO Check the response for errors
    return await response.json() as ListResponse<Expense>;
}

export async function monthlyExpensesLoader({params}: LoaderFunctionArgs): Promise<ListResponse<Expense>> {
    const year = params.year;
    const month = params.month;
    if (year !== undefined && month !== undefined) {
        const from = dayjs().year(parseInt(year)).month(parseInt(month) - 1).date(1);
        const to = from.add(1, 'month');
        return await searchExpenses(dateRangeQuery(from, to));
    }
    // TODO Better error handling
    throw new Error('Nope!');
}

export async function yearlyExpensesLoader({params}: LoaderFunctionArgs): Promise<ListResponse<Expense>> {
    const year = params.year;
    if (year !== undefined) {
        const from = dayjs().year(parseInt(year)).month(0).date(1);
        const to = from.add(1, 'year');
        return await searchExpenses(dateRangeQuery(from, to));
    }
    // TODO Better error handling
    throw new Error('Nope!');
}

async function loadAllExpenses<E extends BaseExpense>(url: string): Promise<ListResponse<E>> {
    const response = await fetch(url, {
        method: 'get'
    });
    // TODO Check the response for errors
    return await response.json() as ListResponse<E>;
}

export async function allExpensesLoader(): Promise<ListResponse<Expense>> {
    return await loadAllExpenses('/api/v1/expenses');
}

export async function allExpenseTemplatesLoader(): Promise<ListResponse<ExpenseTemplate>> {
    return await loadAllExpenses('/api/v1/templates');
}

export async function allScheduledExpensesLoader(): Promise<ListResponse<ScheduledExpense>> {
    return await loadAllExpenses('/api/v1/schedules');
}

export async function expensesFilteredByFieldLoader({params}: LoaderFunctionArgs): Promise<ListResponse<Expense>> {
    const field = params.field;
    const value = params.value;
    if (field !== undefined && value !== undefined) {
        const queryObject: {[key: string]: string} = {};
        queryObject[field] = value;
        return await searchExpenses(queryObject);
    }
    // TODO Better error handling
    throw new Error('Nope!');
}

export async function filterExpenses(filter: string): Promise<ListResponse<Expense>> {
    return await loadAllExpenses(`/api/v1/expenses/search/${filter}`);
}

function getTitle(params: Params, expenseType: string): string {
    const year = params.year;
    const month = params.month;
    if (year !== undefined && month !== undefined) {
        const date = dayjs().month(parseInt(month, 10) - 1).toDate();
        const monthName = date.toLocaleDateString(undefined, {month: 'long'});
        return `${expenseType} in ${monthName} ${year}`;
    } else if (year !== undefined) {
        return `${expenseType} in ${year}`;
    }
    return `All ${expenseType}`;
}

export interface ExpensesParameters<E extends BaseExpense> {
    expenseType: 'Expenses' | 'Scheduled Expenses' | 'Expense Templates';
    renderTable: (expenses: E[], filter: string) => JSX.Element;
}

function ExpensesComponent<E extends BaseExpense>({expenseType, renderTable}: ExpensesParameters<E>) {
    const title = getTitle(useParams(), expenseType);
    const expenses = useLoaderData() as ListResponse<E>;
    const [filter, setFilter] = useState('');

    return (
        <div>
            <Typography variant="h5">{title}</Typography>
            <TextField type="text" value={filter} label="Filter" variant="outlined" onChange={e => setFilter(e.target.value)}/>
            {renderTable(expenses.values, filter)}
        </div>
    );
}

export function Expenses() {
    return (
        <ExpensesComponent expenseType="Expenses" renderTable={
            (expenses: Expense[], filter) => <ExpensesTable expenses={expenses} filter={filter}/>
        }/>
    );
}

export function ExpenseTemplates() {
    return (
        <ExpensesComponent expenseType="Expense Templates" renderTable={
            (expenses: ExpenseTemplate[], filter) => <ExpenseTemplatesTable expenses={expenses} filter={filter}/>
        }/>
    );
}

export function ScheduledExpenses() {
    return (
        <ExpensesComponent expenseType="Scheduled Expenses" renderTable={
            (expenses: ScheduledExpense[], filter) => <ScheduledExpensesTable expenses={expenses} filter={filter}/>
        }/>
    );
}

