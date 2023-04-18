import {LoaderFunctionArgs, Params, useLoaderData, useParams} from 'react-router-dom';
import {Expense} from '../model/expense';
import dayjs, {Dayjs} from 'dayjs';
import {ListResponse} from '../model/responses';
import ExpensesTable from '../components/Expenses-Table';
import {useState} from 'react';
import {TextField, Typography} from '@mui/material';

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
        const to = from.add(1, 'month');
        return await searchExpenses(dateRangeQuery(from, to));
    }
    // TODO Better error handling
    throw new Error('Nope!');
}

export async function allExpensesLoader(): Promise<ListResponse<Expense>> {
    const url = '/api/v1/expenses';
    const response = await fetch(url, {
        method: 'get'
    });
    // TODO Check the response for errors
    return await response.json() as ListResponse<Expense>;
}

function getTitle(params: Params): string {
    const year = params.year;
    const month = params.month;
    if (year !== undefined && month !== undefined) {
        const date = dayjs().month(parseInt(month, 10) - 1).toDate();
        const monthName = date.toLocaleDateString(undefined, {month: 'long'});
        return `Expenses in ${monthName} ${year}`;
    } else if (year !== undefined) {
        return `Expenses in ${year}`;
    }
    return 'All Expenses';
}

export default function Expenses() {
    const title = getTitle(useParams());
    const expenses = useLoaderData() as ListResponse<Expense>;
    const [filter, setFilter] = useState('');

    return (
        <div>
            <Typography variant="h5">{title}</Typography>
            <TextField type="text" value={filter} label="Filter" variant="outlined" onChange={e => setFilter(e.target.value)}/>
            <ExpensesTable expenses={expenses.values} filter={filter}/>
        </div>
    );
}
