import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouteObject, RouterProvider} from 'react-router-dom';
import Root from './routes/Root';
import {
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
import {Endpoint, isSimpleSearchEndpoint, isTimeBasedEndpoint, isViewAllEndpoint} from './endpoints/endpoint';

const endpoints = [new ExpenseEndpoint(), new ScheduledExpenseEndpoint(), new ExpenseTemplateEndpoint()];

function routeObjects<T>(endpoint: Endpoint<T>): RouteObject[] {
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

const allRouteObjects: RouteObject[] = [{
    index: true,
    element: <Dashboard/>
}];
allRouteObjects.push(...endpoints.flatMap(endpoint => routeObjects(endpoint)));

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
            <RouterProvider router={router}/>
        </CurrencyContext.Provider>
    </React.StrictMode>
);
