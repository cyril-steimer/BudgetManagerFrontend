import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouteObject, RouterProvider} from 'react-router-dom';
import Root from './routes/Root';
import {
    addLoader,
    AddWrapper,
    monthlyLoader,
    simpleSearchLoader,
    SimpleSearchWrapper,
    TimeBasedWrapper,
    viewAllLoader,
    ViewAllWrapper,
    yearlyLoader
} from './routes/Endpoint-Routes';
import Dashboard from './routes/Dashboard';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {CurrencyContext} from './context/contexts';
import {ExpenseEndpoint, ExpenseTemplateEndpoint, ScheduledExpenseEndpoint} from './endpoints/expense-endpoints';
import {ModifyingEndpoint, QueryingEndpoint, isSimpleSearchEndpoint, isTimeBasedEndpoint, isViewAllEndpoint} from './endpoints/endpoint';
import {BudgetInPeriodEndpoint} from './endpoints/budget-endpoints';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/de-ch';

const queryingEndpoints: QueryingEndpoint<any>[] = [new ExpenseEndpoint(), new ScheduledExpenseEndpoint(), new ExpenseTemplateEndpoint(), new BudgetInPeriodEndpoint()];
const modifyingEndpoints: ModifyingEndpoint<any>[] = [new ExpenseEndpoint(), new ScheduledExpenseEndpoint(), new ExpenseTemplateEndpoint()];

function queryingRouteObjects<T>(endpoint: QueryingEndpoint<T>): RouteObject[] {
    const result: RouteObject[] = [];
    if (isViewAllEndpoint(endpoint)) {
        result.push({
            path: endpoint.viewAllPath,
            element: <ViewAllWrapper endpoint={endpoint}/>,
            loader: viewAllLoader(endpoint)
        });
    }
    if (isTimeBasedEndpoint(endpoint)) {
        result.push({
            path: `${endpoint.timeBasedPathPrefix}/year/:year`,
            element: <TimeBasedWrapper endpoint={endpoint}/>,
            loader: yearlyLoader(endpoint)
        });
        result.push({
            path: `${endpoint.timeBasedPathPrefix}/year/:year/month/:month`,
            element: <TimeBasedWrapper endpoint={endpoint}/>,
            loader: monthlyLoader(endpoint)
        });
    }
    if (isSimpleSearchEndpoint(endpoint)) {
        result.push({
            path: `${endpoint.simpleSearchPathPrefix}/:field/:value`,
            element: <SimpleSearchWrapper endpoint={endpoint}/>,
            loader: simpleSearchLoader(endpoint)
        });
    }
    return result;
}

function modifyingRouteObjects<T>(endpoint: ModifyingEndpoint<T>): RouteObject[] {
    return [
        {
            path: endpoint.addPath,
            element: <AddWrapper endpoint={endpoint}/>,
            loader: addLoader(endpoint)
        }
    ];
}

const allRouteObjects: RouteObject[] = [{
    index: true,
    element: <Dashboard/>
}];
allRouteObjects.push(...queryingEndpoints.flatMap(endpoint => queryingRouteObjects(endpoint)));
allRouteObjects.push(...modifyingEndpoints.flatMap(endpoint => modifyingRouteObjects(endpoint)));

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root/>,
        children: allRouteObjects
    }
]);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <CurrencyContext.Provider value='CHF'>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='de-ch'>
                <RouterProvider router={router}/>
            </LocalizationProvider>
        </CurrencyContext.Provider>
    </React.StrictMode>
);
