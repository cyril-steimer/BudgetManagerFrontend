export interface Endpoint {
    readonly endpoint: string;
}

/**
 * A querying endpoint in the frontend/backend.
 * 
 * @param <T> The type of data for the endpoint.
 */
export interface QueryingEndpoint<T> extends Endpoint {
    readonly supportsTimeBasedNavigation: boolean;
    readonly supportsViewAll: boolean;
    readonly supportsSimpleSearch: boolean;

    readonly supportsFiltering: boolean;
    renderData(data: T, filter: string): JSX.Element;
}

/**
 * An endpoint which supports time-based navigation, i.e. based on month/year.
 */
export interface TimeBasedEndpoint<T> extends QueryingEndpoint<T> {
    readonly timeBasedPathPrefix: string;
    loadDataForTime(year: number, month?: number): Promise<T>;
}

/**
 * An endpoint which supports viewing all data.
 */
export interface ViewAllEndpoint<T> extends QueryingEndpoint<T> {
    readonly viewAllPath: string;
    loadAllData(): Promise<T>;
}

export type EditorMode = 'add' | 'edit';

/**
 * A modifying endpoint in the frontend/backend.
 */
export interface ModifyingEndpoint<T> extends Endpoint {
    readonly addText: string;
    readonly addPath: string;

    readonly editText: string;
    readonly editPathPrefix: string;

    readonly modifyingApiEndpoint: string;

    readonly idKey: string;

    loadExistingObject(id: string): Promise<T>;
    renderEditor(object: Partial<T>, mode: EditorMode): JSX.Element;
}

/**
 * An endpoint which supports simple search, where some field is compared with some value.
 */
export interface SimpleSearchEndpoint<T> extends QueryingEndpoint<T> {
    readonly simpleSearchPathPrefix: string;
    loadDataForSearch(field: string, value: string): Promise<T>;
}

export function isTimeBasedEndpoint<T>(endpoint: QueryingEndpoint<T>): endpoint is TimeBasedEndpoint<T> {
    return endpoint.supportsTimeBasedNavigation;
}

export function isViewAllEndpoint<T>(endpoint: QueryingEndpoint<T>): endpoint is ViewAllEndpoint<T> {
    return endpoint.supportsViewAll;
}

export function isSimpleSearchEndpoint<T>(endpoint: QueryingEndpoint<T>): endpoint is SimpleSearchEndpoint<T> {
    return endpoint.supportsSimpleSearch;
}