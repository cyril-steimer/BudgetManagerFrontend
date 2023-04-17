import {LoaderFunctionArgs, useLoaderData} from 'react-router-dom';
import {Expense} from '../model/expense';
import dayjs from 'dayjs';
import {ListResponse} from '../model/responses';
import {dateStructToDayJsObject, dateStructToISO8601String, NamedObject} from '../model/common';
import {expenseColumnSettings} from '../util/expenses-table';
import Table from '../components/Table';

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

function filterNamedObject(value: NamedObject, filter: string): boolean {
    return value.name.toLowerCase().includes(filter.toLowerCase());
}

function compareNamedObject(a: NamedObject, b: NamedObject): number {
    return a.name.localeCompare(b.name);
}

export default function MonthlyExpenses() {
    const expenses = useLoaderData() as ListResponse<Expense>;

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
        render: value => value.map(v => v.name).join(", "),
        filter: (value, filter) => value.find(v => filterNamedObject(v, filter)) !== undefined
    });

    return (
        <Table values={expenses.values} columns={[name, amount, category, date, method, author, tags]}/>
    );
}
