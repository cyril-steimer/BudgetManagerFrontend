import {LoaderFunctionArgs, NavigateFunction, Params, useLoaderData, useNavigate, useParams} from 'react-router-dom';
import {useState} from 'react';
import {Header, TimeRangeParameters} from '../components/Header';
import {Endpoint, SimpleSearchEndpoint, TimeBasedEndpoint, ViewAllEndpoint, isViewAllEndpoint} from '../endpoints/endpoint';
import {Chip} from '@mui/material';
import {useIsNavigating} from '../hooks/hooks';

export type Loader<T> = (args: LoaderFunctionArgs) => Promise<T>;

export function viewAllLoader<T>(endpoint: ViewAllEndpoint<T>): Loader<T> {
    return () => endpoint.loadAllData();
}

export function getViewAllDataUrl<T>(endpoint: ViewAllEndpoint<T>): string {
    return `/${endpoint.viewAllPath}`;
}

export function yearlyLoader<T>(endpoint: TimeBasedEndpoint<T>): Loader<T> {
    return ({params}: LoaderFunctionArgs) => {
        const year = params.year;
        if (year !== undefined) {
            return endpoint.loadDataForTime(parseInt(year, 10));
        }
        // TODO Better error handling
        throw new Error('Nope!');
    };
}

export function getYearlyDataUrl<T>(endpoint: TimeBasedEndpoint<T>, year: number): string {
    return `/${endpoint.timeBasedPathPrefix}/year/${year}`;
}

export function monthlyLoader<T>(endpoint: TimeBasedEndpoint<T>): Loader<T> {
    return ({params}: LoaderFunctionArgs) => {
        const year = params.year;
        const month = params.month;
        if (year !== undefined && month !== undefined) {
            return endpoint.loadDataForTime(parseInt(year, 10), parseInt(month, 10));
        }
        // TODO Better error handling
        throw new Error('Nope!');
    };
}

export function getMonthlyDataUrl<T>(endpoint: TimeBasedEndpoint<T>, year: number, month: number): string {
    return `/${endpoint.timeBasedPathPrefix}/year/${year}/month/${month}`;
}

export function simpleSearchLoader<T>(endpoint: SimpleSearchEndpoint<T>): Loader<T> {
    return ({params}: LoaderFunctionArgs) => {
        const field = params.field;
        const value = params.value;
        if (field !== undefined && value !== undefined) {
            return endpoint.loadDataForSearch(field, value);
        }
        // TODO Better error handling
        throw new Error('Nope!');
    }
}

export function getSimpleSearchUrl<T>(endpoint: SimpleSearchEndpoint<T>, field: string, value: string): string {
    return `/${endpoint.simpleSearchPathPrefix}/${field}/${encodeURIComponent(value)}`;
}

function getTimeRangeParameters<T>(endpoint: TimeBasedEndpoint<T>, navigate: NavigateFunction, params: Params<string>): TimeRangeParameters | undefined {
    const year = params.year;
    const month = params.month;
    let parameters: TimeRangeParameters | undefined = undefined;
    if (year !== undefined) {
        parameters = {
            activeYear: parseInt(year, 10),
            setActiveTimeRange(range) {
                if (range.activeMonth === undefined) {
                    navigate(getYearlyDataUrl(endpoint, range.activeYear));
                } else {
                    navigate(getMonthlyDataUrl(endpoint, range.activeYear, range.activeMonth));
                }
            },
        };
        if (month !== undefined) {
            parameters.activeMonth = parseInt(month, 10);
        }
    }
    return parameters;
}

function getSimpleFilter(params: Params<string>): [string, string] | undefined {
    const field = params.field;
    const value = params.value;
    if (field !== undefined && value !== undefined) {
        return [field, value];
    }
    return undefined;
}

interface EndpointContentWrapperParameters<T> {
    endpoint: Endpoint<T>;
    timeRange?: TimeRangeParameters;
    simpleFilter?: [string, string];
}

function EndpointContentWrapper<T>({endpoint, timeRange, simpleFilter}: EndpointContentWrapperParameters<T>) {
    const data = useLoaderData() as T;
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();
    const isNavigating = useIsNavigating();

    let clearSimpleFilter: (() => void) | undefined;
    if (isViewAllEndpoint(endpoint)) {
        clearSimpleFilter = () => navigate(getViewAllDataUrl(endpoint));
    }

    return (
        <div>
            <Header filter={endpoint.supportsFiltering ? {filter, setFilter} : undefined} timeRange={timeRange}/>
            {simpleFilter !== undefined &&

                <Chip
                    label={`${simpleFilter[0]} = ${simpleFilter[1]}`}
                    sx={{marginTop: '10px', marginBottom: '10px'}}
                    onDelete={clearSimpleFilter}
                    disabled={isNavigating}
                />
            }
            {endpoint.renderData(data, filter)}
        </div>
    );
}

export function ViewAllWrapper<T>({endpoint}: {endpoint: ViewAllEndpoint<T>}) {
    return <EndpointContentWrapper endpoint={endpoint}/>
}

export function TimeBasedWrapper<T>({endpoint}: {endpoint: TimeBasedEndpoint<T>}) {
    const timeRange = getTimeRangeParameters(endpoint, useNavigate(), useParams());
    return <EndpointContentWrapper endpoint={endpoint} timeRange={timeRange}/>
}

export function SimpleSearchWrapper<T>({endpoint}: {endpoint: SimpleSearchEndpoint<T>}) {
    const simpleFilter = getSimpleFilter(useParams());
    return <EndpointContentWrapper endpoint={endpoint} simpleFilter={simpleFilter}/>
}