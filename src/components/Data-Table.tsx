import {useState} from 'react';
import {styled} from '@mui/material/styles';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel} from '@mui/material';

// https://mui.com/material-ui/react-table/#customization
const StyledTableRow = styled(TableRow)(({theme}) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover
    }
}));

export interface ColumnSettingsInterface<T, K extends keyof T> {
    name: string;
    render: (value: T[K]) => string | JSX.Element;
    filter?: (value: T[K], filter: string) => boolean;
    compare?: (a: T[K], b: T[K]) => number;
    renderSummary?: (values: T[K][]) => string | JSX.Element;
}

export class ColumnSettings<T> {
    private constructor(
        readonly name: string,
        readonly id: string,
        readonly render: (value: T) => string | JSX.Element,
        readonly filter: ((value: T, filter: string) => boolean) | undefined,
        readonly compare: ((a: T, b: T) => number) | undefined,
        readonly renderSummary: ((values: T[]) => string | JSX.Element) | undefined) {
    }

    static of<T, K extends keyof T & string>(key: K, settings: ColumnSettingsInterface<T, K>): ColumnSettings<T> {
        return new ColumnSettings<T>(
            settings.name,
            key,
            value => settings.render(value[key]),
            settings.filter === undefined ? undefined : (value, filter) => settings.filter!(value[key], filter),
            settings.compare === undefined ? undefined : (a, b) => settings.compare!(a[key], b[key]),
            settings.renderSummary === undefined ? undefined : (values) => settings.renderSummary!(values.map(v => v[key]))
        );
    }
}

interface TableRowParameters<T> {
    value: T;
    columns: ColumnSettings<T>[];
}

function DataTableRow<T>({value, columns}: TableRowParameters<T>) {
    return (
        <StyledTableRow>
            {columns.map(c => <TableCell key={c.id}>{c.render(value)}</TableCell>)}
        </StyledTableRow>
    );
}

interface TableSummaryRowParameters<T> {
    values: T[];
    columns: ColumnSettings<T>[];
}

function DataTableSummaryRow<T>({values, columns}: TableSummaryRowParameters<T>) {
    function render(column: ColumnSettings<T>): string | JSX.Element {
        const renderer = column.renderSummary;
        if (renderer !== undefined) {
            return renderer(values);
        }
        return '';
    }

    return (
        <StyledTableRow>
            {columns.map(c => <TableCell key={c.id}>{render(c)}</TableCell>)}
        </StyledTableRow>
    );
}

export interface TableItem {
    id: string;
}

export type SortDirection = 'asc' | 'desc';

export interface TableParameters<T extends TableItem> {
    values: T[];
    columns: ColumnSettings<T>[];
    filter?: string;
    initialSortColumn?: ColumnSettings<T>;
    initialSortDirection?: SortDirection;
    addSummaryRow?: boolean;
}

export function DataTable<T extends TableItem>(
    {
        values,
        columns,
        filter,
        initialSortColumn,
        initialSortDirection,
        addSummaryRow
    }: TableParameters<T>
) {
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

    function updateSort(column: ColumnSettings<T>) {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortDirection('asc');
            setSortColumn(column);
        }
    }

    function headerCell(column: ColumnSettings<T>): JSX.Element {
        if (column.compare === undefined) {
            return <TableCell key={column.id}>{column.name}</TableCell>;
        }
        return (
            <TableCell key={column.id} sortDirection={sortColumn === column ? sortDirection : false} onClick={() => updateSort(column)}>
                <TableSortLabel active={sortColumn === column} direction={sortColumn === column ? sortDirection : 'asc'}>
                    {column.name}
                </TableSortLabel>
            </TableCell>
        );
    }

    const sortedFilteredValues = values
        .filter(value => filter === undefined || filter.length === 0 || matchesFilter(value, filter))
        .sort((a, b) => compare(a, b));

    const canAddSummaryRow = columns.find(c => c.renderSummary !== undefined) !== undefined;

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        {columns.map(headerCell)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedFilteredValues.map(value => <DataTableRow value={value} columns={columns} key={value.id}/>)}
                    {addSummaryRow && canAddSummaryRow !== undefined && 
                        <DataTableSummaryRow values={sortedFilteredValues} columns={columns}/>
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
}
