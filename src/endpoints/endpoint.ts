/**
 * An endpoint in the frontend/backend.
 * 
 * @param <T> The type of data for the endpoint.
 */
export interface Endpoint<T> {
    readonly supportsTimeBasedNavigation: boolean;
    readonly supportsViewAll: boolean;
    readonly supportsSimpleSearch: boolean;

    readonly supportsFiltering: boolean;
    renderData(data: T, filter: string): JSX.Element;
}

/**
 * An endpoint which supports time-based navigation, i.e. based on month/year.
 */
export interface TimeBasedEndpoint<T> extends Endpoint<T> {
    readonly timeBasedPathPrefix: string;
    loadDataForTime(year: number, month?: number): Promise<T>;
}

/**
 * An endpoint which supports viewing all data.
 */
export interface ViewAllEndpoint<T> extends Endpoint<T> {
    readonly viewAllPath: string;
    loadAllData(): Promise<T>;
}

/**
 * An endpoint which supports simple search, where some field is compared with some value.
 */
export interface SimpleSearchEndpoint<T> extends Endpoint<T> {
    readonly simpleSearchPathPrefix: string;
    loadDataForSearch(field: string, value: string): Promise<T>;
}

export function isTimeBasedEndpoint<T>(endpoint: Endpoint<T>): endpoint is TimeBasedEndpoint<T> {
    return endpoint.supportsTimeBasedNavigation;
}

export function isViewAllEndpoint<T>(endpoint: Endpoint<T>): endpoint is ViewAllEndpoint<T> {
    return endpoint.supportsViewAll;
}

export function isSimpleSearchEndpoint<T>(endpoint: Endpoint<T>): endpoint is SimpleSearchEndpoint<T> {
    return endpoint.supportsSimpleSearch;
}
