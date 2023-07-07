import {LoaderFunctionArgs, Params, useLoaderData, useParams} from 'react-router-dom';
import {BaseExpense, Expense, ExpenseTemplate, ScheduledExpense} from '../model/expense';
import dayjs, {Dayjs} from 'dayjs';
import {ListResponse} from '../model/responses';
import {useState} from 'react';
import {ExpensesTable, ExpenseTemplatesTable, ScheduledExpensesTable} from '../components/Expenses-Table';
import {Header} from '../components/Header';

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

export type ExpenseEndpoint = 'expenses' | 'templates' | 'schedules';

export function getFilterByFieldUrl(endpoint: ExpenseEndpoint, field: string, value: string): string {
    return `/${endpoint}/field/${field}/${encodeURIComponent(value)}`;
}

async function search<T extends Expense>(endpoint: ExpenseEndpoint, query: object): Promise<ListResponse<T>> {
    const url = `/api/v1/${endpoint}/search?sort=date&dir=desc`;
    const response = await fetch(url, {
        method: 'post',
        body: JSON.stringify(query)
    });
    // TODO Check the response for errors
    return await response.json() as ListResponse<T>;
}

export async function monthlyExpensesLoader({params}: LoaderFunctionArgs): Promise<ListResponse<Expense>> {
    const year = params.year;
    const month = params.month;
    if (year !== undefined && month !== undefined) {
        const from = dayjs().year(parseInt(year)).month(parseInt(month) - 1).date(1);
        const to = from.add(1, 'month');
        return await search('expenses', dateRangeQuery(from, to));
    }
    // TODO Better error handling
    throw new Error('Nope!');
}

export async function yearlyExpensesLoader({params}: LoaderFunctionArgs): Promise<ListResponse<Expense>> {
    const year = params.year;
    if (year !== undefined) {
        const from = dayjs().year(parseInt(year)).month(0).date(1);
        const to = from.add(1, 'year');
        return await search('expenses', dateRangeQuery(from, to));
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

async function loadExpensesFilteredByField<T extends Expense>(params: Params<string>, endpoint: ExpenseEndpoint): Promise<ListResponse<T>> {
    const field = params.field;
    const value = params.value;
    if (field !== undefined && value !== undefined) {
        const queryObject: {[key: string]: string} = {};
        queryObject[field] = value;
        return await search(endpoint, queryObject);
    }
    // TODO Better error handling
    throw new Error('Nope!');

}

export async function expensesFilteredByFieldLoader({params}: LoaderFunctionArgs): Promise<ListResponse<Expense>> {
    return loadExpensesFilteredByField(params, 'expenses');
}

export async function expenseTemplatesFilteredByFieldLoader({params}: LoaderFunctionArgs): Promise<ListResponse<ExpenseTemplate>> {
    return loadExpensesFilteredByField(params, 'templates');
}

export async function scheduledExpensesFilteredByFieldLoader({params}: LoaderFunctionArgs): Promise<ListResponse<ScheduledExpense>> {
    return loadExpensesFilteredByField(params, 'schedules');
}

export async function filterExpenses(filter: string): Promise<ListResponse<Expense>> {
    return await loadAllExpenses(`/api/v1/expenses/search/${filter}`);
}

export interface ExpensesParameters<E extends BaseExpense> {
    renderTable: (expenses: E[], filter: string) => JSX.Element;
}

function ExpensesComponent<E extends BaseExpense>({renderTable}: ExpensesParameters<E>) {
    const expenses = useLoaderData() as ListResponse<E>;
    const [filter, setFilter] = useState('');

    return (
        <div>
            <Header filter={{filter, setFilter}}/>
            {renderTable(expenses.values, filter)}
        </div>
    );
}

export function Expenses() {
    return (
        <ExpensesComponent renderTable={(expenses: Expense[], filter) =>
            <ExpensesTable expenses={expenses} filter={filter}/>
        }/>
    );
}

export function ExpenseTemplates() {
    return (
        <ExpensesComponent renderTable={(expenses: ExpenseTemplate[], filter) =>
            <ExpenseTemplatesTable expenses={expenses} filter={filter}/>
        }/>
    );
}

export function ScheduledExpenses() {
    return (
        <ExpensesComponent renderTable={(expenses: ScheduledExpense[], filter) =>
            <ScheduledExpensesTable expenses={expenses} filter={filter}/>
        }/>
    );
}

