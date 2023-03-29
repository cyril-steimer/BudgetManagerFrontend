import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Root from './routes/Root';
import MonthlyExpenses, {monthlyExpensesLoader} from './routes/Monthly-Expenses';
import Dashboard from './routes/Dashboard';

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
                element: <MonthlyExpenses/>,
                loader: monthlyExpensesLoader
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
