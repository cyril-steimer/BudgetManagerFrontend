import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Root from './routes/Root';
import {
    allExpensesLoader,
    allExpenseTemplatesLoader,
    allScheduledExpensesLoader,
    Expenses,
    ExpenseTemplates,
    monthlyExpensesLoader,
    ScheduledExpenses,
    yearlyExpensesLoader
} from './routes/Expenses';
import Dashboard from './routes/Dashboard';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root/>,
        children: [
            {
                index: true,
                element: <Dashboard/>
            },
            {
                path: 'expenses/year/:year/month/:month',
                element: <Expenses/>,
                loader: monthlyExpensesLoader
            },
            {
                path: 'expenses/year/:year',
                element: <Expenses/>,
                loader: yearlyExpensesLoader
            },
            {
                path: 'expenses',
                element: <Expenses/>,
                loader: allExpensesLoader
            },
            {
                path: 'templates',
                element: <ExpenseTemplates/>,
                loader: allExpenseTemplatesLoader
            },
            {
                path: 'schedules',
                element: <ScheduledExpenses/>,
                loader: allScheduledExpensesLoader
            }
        ]
    }
]);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);
