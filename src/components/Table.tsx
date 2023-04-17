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

export interface TableParameters<T extends TableItem> {
    values: T[];
    columns: ColumnSettings<T>[];
    filter?: string;
}

export default function Table<T extends TableItem>({values, columns, filter}: TableParameters<T>) {
    function matchesFilter(value: T, filter: string): boolean {
        return columns.find(col => col.filter !== undefined && col.filter(value, filter)) !== undefined;
    }

    // TODO Sorting
    return (
        <table>
            <thead>
            <tr>
                {columns.map(s => <th key={s.id}>{s.name}</th>)}
            </tr>
            </thead>
            <tbody>
            {
                values
                    .filter(value => filter === undefined || filter.length == 0 || matchesFilter(value, filter))
                    .map(value => <TableRow value={value} columns={columns} key={value.id}/>)
            }
            </tbody>
        </table>
    );
}
