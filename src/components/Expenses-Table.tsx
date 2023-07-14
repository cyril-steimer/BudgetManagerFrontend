import {BaseExpense, Expense, ExpenseTemplate, ScheduledExpense, scheduleToString, sumAmount} from '../model/expense';
import {DataTable, ColumnSettings, ColumnSettingsInterface} from './Data-Table';
import {compareAmount, compareDateStruct, compareNamedObject, dateStructToISO8601String, NamedObject} from '../model/common';
import {Chip, IconButton} from '@mui/material';
import {Link, NavigateFunction, useNavigate} from 'react-router-dom';
import {useIsNavigating} from '../hooks/hooks';
import {ModifyingEndpoint, SimpleSearchEndpoint} from '../endpoints/endpoint';
import {getEditUrl, getSimpleSearchUrl} from '../routes/Endpoint-Routes';
import {ListResponse} from '../model/responses';
import {CurrencyCell} from './Common';
import EditIcon from '@mui/icons-material/Edit';

function baseExpenseColumnSettings<K extends keyof BaseExpense>(key: K, settings: ColumnSettingsInterface<BaseExpense, K>): ColumnSettings<BaseExpense> {
    return ColumnSettings.of(key, settings);
}

function expenseColumnSettings<K extends keyof Expense>(key: K, settings: ColumnSettingsInterface<Expense, K>): ColumnSettings<Expense> {
    return ColumnSettings.of(key, settings);
}

function scheduledExpenseColumnSettings<K extends keyof ScheduledExpense>(key: K, settings: ColumnSettingsInterface<ScheduledExpense, K>): ColumnSettings<ScheduledExpense> {
    return ColumnSettings.of(key, settings);
}

function filterNamedObject(value: NamedObject, filter: string): boolean {
    return value.name.toLowerCase().includes(filter.toLowerCase());
}

type Endpoint<E extends BaseExpense> = SimpleSearchEndpoint<ListResponse<E>> & ModifyingEndpoint<E>;

export interface ExpensesTableParameters<E extends BaseExpense> {
    endpoint: Endpoint<E>;
    expenses: E[];
    filter?: string;
}

type GetSearchUrl = (field: string, value: string) => string;

class BaseColumns<E extends BaseExpense> {
    readonly name: ColumnSettings<E>;
    readonly amount: ColumnSettings<E>;
    readonly category: ColumnSettings<E>;
    readonly method: ColumnSettings<E>;
    readonly author: ColumnSettings<E>;
    readonly tags: ColumnSettings<E>;
    readonly edit: ColumnSettings<E>;

    constructor(endpoint: Endpoint<E>, navigate: NavigateFunction) {
        const getSearchUrl = (field: string, value: string) => getSimpleSearchUrl(endpoint, field, value);

        this.name = baseExpenseColumnSettings('name', {
            name: 'Name',
            render: value => value.name,
            filter: filterNamedObject,
            compare: compareNamedObject,
            renderSummary: _ => <b>Total</b>
        });

        this.amount = baseExpenseColumnSettings('amount', {
            name: 'Amount',
            render: value => <CurrencyCell value={value.amount}/>,
            compare: compareAmount,
            renderSummary: values => <CurrencyCell value={sumAmount(values)}/>
        });

        this.category = baseExpenseColumnSettings('category', {
            name: 'Category',
            render: value => (
                <FilterCell getSearchUrl={getSearchUrl} field='category' value={value?.name ?? ''}/>
            ),
            filter: filterNamedObject,
            compare: compareNamedObject
        });

        this.method = baseExpenseColumnSettings('method', {
            name: 'Method',
            render: value => (
                <FilterCell getSearchUrl={getSearchUrl} field='method' value={value.name ?? ''}/>
            ),
            filter: filterNamedObject,
            compare: compareNamedObject
        });

        this.author = baseExpenseColumnSettings('author', {
            name: 'Author',
            render: value => (
                <FilterCell getSearchUrl={getSearchUrl} field='author' value={value.name ?? ''}/>
            ),
            filter: filterNamedObject,
            compare: compareNamedObject
        });

        this.tags = baseExpenseColumnSettings('tags', {
            name: 'Tags',
            render: value => (
                <div>
                    {value.map(tag => <TagChip key={tag.name} getSearchUrl={getSearchUrl} tag={tag.name}/>)}
                </div>
            ),
            filter: (value, filter) => value.find(v => filterNamedObject(v, filter)) !== undefined
        });

        this.edit = baseExpenseColumnSettings('id', {
            name: '',
            render: id => (
                <IconButton onClick={() => navigate(getEditUrl(endpoint, id))}>
                    <EditIcon/>
                </IconButton>
            )
        })
    }
}

function FilterCell({getSearchUrl, field, value}: {getSearchUrl: GetSearchUrl, field: string, value: string}) {
    const isNavigating = useIsNavigating();
    if (isNavigating) {
        return <span>{value}</span>;
    }
    return <Link to={getSearchUrl(field, value)} >{value}</Link>;
}

function TagChip({getSearchUrl, tag}: {getSearchUrl: GetSearchUrl, tag: string}) {
    const navigate = useNavigate();
    return <Chip
        label={tag}
        onClick={() => navigate(getSearchUrl('tag', tag))}
        color='primary'
        variant='outlined'
        disabled={useIsNavigating()}
    />;
}

export function ScheduledExpensesTable({endpoint, expenses, filter}: ExpensesTableParameters<ScheduledExpense>) {
    const start = scheduledExpenseColumnSettings('startDate', {
        name: 'Start Date',
        render: dateStructToISO8601String,
        compare: compareDateStruct
    });
    const end = scheduledExpenseColumnSettings('endDate', {
        name: 'End Date',
        render: dateStructToISO8601String,
        compare: compareDateStruct
    });
    const schedule = scheduledExpenseColumnSettings('schedule', {
        name: 'Schedule',
        render: scheduleToString
    });

    const base = new BaseColumns(endpoint, useNavigate());
    const columns = [base.name, base.amount, base.category, start, end, schedule, base.method, base.author, base.tags, base.edit];

    return <DataTable
        values={expenses}
        columns={columns}
        filter={filter}
        initialSortColumn={base.name}
    />;
}

export function ExpenseTemplatesTable({endpoint, expenses, filter}: ExpensesTableParameters<ExpenseTemplate>) {
    const base = new BaseColumns(endpoint, useNavigate());
    const columns = [base.name, base.amount, base.category, base.method, base.author, base.tags, base.edit];

    return <DataTable
        values={expenses}
        columns={columns}
        filter={filter}
        initialSortColumn={base.name}
    />;
}

export function ExpensesTable({endpoint, expenses, filter}: ExpensesTableParameters<Expense>) {
    const date = expenseColumnSettings('date', {
        name: 'Date',
        render: dateStructToISO8601String,
        compare: compareDateStruct
    });

    const base = new BaseColumns(endpoint, useNavigate());
    const columns = [base.name, base.amount, base.category, date, base.method, base.author, base.tags, base.edit];

    return <DataTable
        values={expenses}
        columns={columns}
        filter={filter}
        initialSortColumn={date}
        addSummaryRow
    />;
}
