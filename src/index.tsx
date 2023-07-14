import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouteObject, RouterProvider} from 'react-router-dom';
import Root from './routes/Root';
import {
    addLoader,
    editLoader,
    EditWrapper,
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
import {BudgetEndpoint} from './endpoints/budget-endpoint';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/de-ch';
import {Container} from '@mui/material';
import {BaseExpense} from './model/expense';

const queryingEndpoints: QueryingEndpoint<any>[] = [new ExpenseEndpoint(), new ScheduledExpenseEndpoint(), new ExpenseTemplateEndpoint(), new BudgetEndpoint()];
const modifyingExpenseEndpoints: ModifyingEndpoint<BaseExpense>[] = [new ExpenseEndpoint(), new ScheduledExpenseEndpoint(), new ExpenseTemplateEndpoint()];
const modifyingEndpoints: ModifyingEndpoint<any>[] = [...modifyingExpenseEndpoints, new BudgetEndpoint()];

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
            element: <EditWrapper endpoint={endpoint} mode='add'/>,
            loader: addLoader()
        },
        {
            path: `${endpoint.editPathPrefix}/:id`,
            element: <EditWrapper endpoint={endpoint} mode='edit'/>,
            loader: editLoader(endpoint)
        }
    ];
}

function duplicatingRouteObjects<T extends BaseExpense>(endpoints: ModifyingEndpoint<T>[]): RouteObject[] {
    const result: RouteObject[] = [];
    for (let duplicationTarget of endpoints) {
        for (let duplicationSource of endpoints) {
            result.push({
                path: `${duplicationTarget.addPath}/copy/${duplicationSource.endpoint}/:id`,
                element: <EditWrapper endpoint={duplicationTarget} mode='add'/>,
                loader: editLoader(duplicationSource)
            });
        }
    }
    return result;
}

const allRouteObjects: RouteObject[] = [{
    index: true,
    element: <Dashboard/>
}];
allRouteObjects.push(...queryingEndpoints.flatMap(endpoint => queryingRouteObjects(endpoint)));
allRouteObjects.push(...modifyingEndpoints.flatMap(endpoint => modifyingRouteObjects(endpoint)));
allRouteObjects.push(...duplicatingRouteObjects(modifyingExpenseEndpoints));

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
                <Container maxWidth='xl'>
                    <RouterProvider router={router}/>
                </Container>
            </LocalizationProvider>
        </CurrencyContext.Provider>
    </React.StrictMode>
);
