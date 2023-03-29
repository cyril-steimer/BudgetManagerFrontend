import {Expense} from '../model/expense';
import {dateStructToISO8601String} from '../model/common';

interface ExpenseRowParameters {
    expense: Expense;
}

function ExpenseRow({expense}: ExpenseRowParameters) {
    // TODO Make various features clickable for filtering
    return (
        <tr>
            <td>{expense.name.name}</td>
            <td>{expense.amount.amount}</td>
            <td>{expense.category.name}</td>
            <td>{dateStructToISO8601String(expense.date)}</td>
            <td>{expense.method.name}</td>
            <td>{expense.author.name}</td>
            <td>{expense.tags.map(t => t.name).join(', ')}</td>
        </tr>
    );
}

export interface ExpenseTableParameters {
    expenses: Expense[];
}

export default function ExpenseTable({expenses}: ExpenseTableParameters) {
    // TODO Filtering, sorting
    return (
        <table>
            <thead>
            <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>Author</th>
                <th>Tags</th>
            </tr>
            </thead>
            <tbody>
            {expenses.map(exp => <ExpenseRow expense={exp} key={exp.id}/>)}
            </tbody>
        </table>
    );
}
