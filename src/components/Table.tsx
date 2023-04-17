export interface ColumnSettingsInterface<T, K extends keyof T> {
    name: string;
    render: (value: T[K]) => string;
    filter?: (value: T[K], filter: string) => boolean;
    compare?: (a: T[K], b: T[K]) => number;
}

export class ColumnSettings<T> {
    private constructor(
        readonly name: string,
        readonly render: (value: T) => string,
        readonly filter: ((value: T, filter: string) => boolean) | undefined,
        readonly compare: ((a: T, b: T) => number) | undefined) {
    }

    static of<T, K extends keyof T>(key: K, settings: ColumnSettingsInterface<T, K>): ColumnSettings<T> {
        return new ColumnSettings<T>(
            settings.name,
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
            {columns.map(c => <td>{c.render(value)}</td>)}
        </tr>
    );
}

interface TableItem {
    id: string;
}

export interface TableParameters<T extends TableItem> {
    values: T[];
    columns: ColumnSettings<T>[];
}

export default function Table<T extends TableItem>({values, columns}: TableParameters<T>) {
    // TODO Filtering, sorting
    return (
        <table>
            <thead>
            <tr>
                {columns.map(s => <th>{s.name}</th>)}
            </tr>
            </thead>
            <tbody>
            {values.map(value => <TableRow value={value} columns={columns} key={value.id}/>)}
            </tbody>
        </table>
    );
}
