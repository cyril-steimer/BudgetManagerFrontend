import {LoaderFunctionArgs, useLoaderData} from 'react-router-dom';
import {Expense} from '../model/expense';
import dayjs from 'dayjs';
import {ListResponse} from '../model/responses';
import ExpensesTable from '../components/Expenses-Table';
import {useState} from 'react';
import {TextField} from '@mui/material';

export async function monthlyExpensesLoader({params}: LoaderFunctionArgs): Promise<ListResponse<Expense>> {
    const year = params['year'];
    const month = params['month'];
    if (year !== undefined && month !== undefined) {
        const from = dayjs().year(parseInt(year)).month(parseInt(month) - 1);
        const to = from.add(1, 'month');
        // TODO Define a type for the query
        const query = {
            and: [
                {
                    date: {
                        date: {
                            year: from.year(),
                            month: from.month() + 1,
                            day: 1
                        },
                        comparison: '>='
                    }
                },
                {
                    date: {
                        date: {
                            year: to.year(),
                            month: to.month() + 1,
                            day: 1
                        },
                        comparison: '<'
                    }
                }
            ]
        };
        const url = '/api/v1/expenses/search?sort=date&dir=desc';
        const response = await fetch(url, {
            method: 'post',
            body: JSON.stringify(query)
        });
        // TODO Check the response for errors
        return await response.json() as ListResponse<Expense>;
    }
    // TODO Better error handling
    throw new Error('Nope!');
}

export default function MonthlyExpenses() {
    const expenses = useLoaderData() as ListResponse<Expense>;
    const [filter, setFilter] = useState('');

    return (
        <div>
            <TextField type="text" value={filter} label="Search" variant="outlined" onChange={e => setFilter(e.target.value)}/>
            <ExpensesTable expenses={expenses.values} filter={filter}/>
        </div>
    );
}
