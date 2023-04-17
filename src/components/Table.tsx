import {useState} from 'react';

export interface ColumnSettingsInterface<T, K extends keyof T> {
    name: string;
    render: (value: T[K]) => string;
    filter?: (value: T[K], filter: string) => boolean;
    compare?: (a: T[K], b: T[K]) => number;
}

export class ColumnSettings<T> {
    private constructor(
        readonly name: string,
        readonly id: string,
        readonly render: (value: T) => string,
        readonly filter: ((value: T, filter: string) => boolean) | undefined,
        readonly compare: ((a: T, b: T) => number) | undefined) {
    }

    static of<T, K extends keyof T & string>(key: K, settings: ColumnSettingsInterface<T, K>): ColumnSettings<T> {
        return new ColumnSettings<T>(
            settings.name,
            key,
            value => settings.render(value[key]),
            settings.filter === undefined ? undefined : (value, filter) => settings.filter!(value[key], filter),
            settings.compare === undefined ? undefined : (a, b) => settings.compare!(a[key], b[key])
        );
    }
}

interface TableRowParameters<T> {
    value: T;
    columns: ColumnSettings<T>[];
}

function TableRow<T>({value, columns}: TableRowParameters<T>) {
    return (
        <tr>
            {columns.map(c => <td key={c.id}>{c.render(value)}</td>)}
        </tr>
    );
}

interface TableItem {
    id: string;
}

export type SortDirection = 'asc' | 'desc';

export interface TableParameters<T extends TableItem> {
    values: T[];
    columns: ColumnSettings<T>[];
    filter?: string;
    initialSortColumn?: ColumnSettings<T>
    initialSortDirection?: SortDirection;
}

export default function Table<T extends TableItem>({values, columns, filter, initialSortColumn, initialSortDirection}: TableParameters<T>) {
    const [sortColumn, setSortColumn] = useState(initialSortColumn);
    const [sortDirection, setSortDirection] = useState(initialSortDirection ?? 'asc');

    function matchesFilter(value: T, filter: string): boolean {
        return columns.find(col => col.filter !== undefined && col.filter(value, filter)) !== undefined;
    }

    function compare(a: T, b: T): number {
        if (sortColumn === undefined || sortColumn.compare === undefined) {
            return 0; // No sorting (sort is stable nowadays: https://developer.mozilla.org/en-US/docs/web/javascript/reference/global_objects/array/sort#sort_stability)
        } else {
            const compared = sortColumn.compare(a, b);
            return sortDirection === 'asc' ? compared : -compared;
        }
    }

    function getSortIcon(column: ColumnSettings<T>): string {
        if (sortColumn === column) {
            return sortDirection === 'asc' ? ' ↑' : ' ↓';
        }
        return '';
    }

    function updateSort(column: ColumnSettings<T>) {
        if (column.compare === undefined) {
            return; // Cannot sort this column
        }
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortDirection('asc');
            setSortColumn(column);
        }
    }

    return (
        <table>
            <thead>
            <tr>
                {
                    columns
                        .map(col => <th onClick={() => updateSort(col)} key={col.id}>{col.name}{getSortIcon(col)}</th>)
                }
            </tr>
            </thead>
            <tbody>
            {
                values
                    .filter(value => filter === undefined || filter.length == 0 || matchesFilter(value, filter))
                    .sort((a, b) => compare(a, b))
                    .map(value => <TableRow value={value} columns={columns} key={value.id}/>)
            }
            </tbody>
        </table>
    );
}
