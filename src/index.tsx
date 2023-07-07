import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Root from './routes/Root';
import {
    allExpensesLoader,
    allExpenseTemplatesLoader,
    allScheduledExpensesLoader,
    Expenses,
    expensesFilteredByFieldLoader,
    ExpenseTemplates,
    expenseTemplatesFilteredByFieldLoader,
    monthlyExpensesLoader,
    ScheduledExpenses,
    scheduledExpensesFilteredByFieldLoader,
    yearlyExpensesLoader
} from './routes/Expenses';
import Dashboard from './routes/Dashboard';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {CurrencyContext} from './context/contexts';

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
            },
            {
                path: 'expenses/field/:field/:value',
                element: <Expenses/>,
                loader: expensesFilteredByFieldLoader
            },
            {
                path: 'templates/field/:field/:value',
                element: <ExpenseTemplates/>,
                loader: expenseTemplatesFilteredByFieldLoader
            },
            {
                path: 'schedules/field/:field/:value',
                element: <ScheduledExpenses/>,
                loader: scheduledExpensesFilteredByFieldLoader
            }
        ]
    }
]);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <CurrencyContext.Provider value='CHF'>
            <RouterProvider router={router}/>
        </CurrencyContext.Provider>
    </React.StrictMode>
);
