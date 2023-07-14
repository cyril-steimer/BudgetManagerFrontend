import dayjs from "dayjs";
import {BaseExpense, Expense, ExpenseTemplate, ScheduledExpense} from "../model/expense";
import {ListResponse} from "../model/responses";
import {EditorMode, ModifyingEndpoint, SimpleSearchEndpoint, TimeBasedEndpoint, ViewAllEndpoint} from "./endpoint";
import {ExpenseTemplatesTable, ExpensesTable, ScheduledExpensesTable} from "../components/Expenses-Table";
import {ExpenseEditor, ExpenseTemplateEditor, InitialExpense, ScheduledExpenseEditor} from "../components/Expense-Editor";

function toInitialExpense(expense: Partial<BaseExpense>): InitialExpense {
    return {
        ...expense,
        id: expense.id ?? ''
    };
}

abstract class BasicExpenseEndpoint<T extends BaseExpense> implements ViewAllEndpoint<ListResponse<T>>, SimpleSearchEndpoint<ListResponse<T>>, ModifyingEndpoint<T> {

    readonly supportsViewAll = true;
    readonly supportsSimpleSearch = true;
    readonly supportsFiltering = true;
    
    readonly viewAllPath: string;
    readonly timeBasedPathPrefix: string;
    readonly simpleSearchPathPrefix: string;

    readonly addPath: string;
    readonly editPathPrefix: string;
    readonly modifyingApiEndpoint: string;

    constructor(readonly endpoint: string, readonly addText: string, readonly supportsTimeBasedNavigation: boolean) {
        this.viewAllPath = endpoint;
        this.timeBasedPathPrefix = endpoint;
        this.simpleSearchPathPrefix = `${endpoint}/field`;
        this.addPath = `add/${endpoint}`;
        this.editPathPrefix = `edit/${endpoint}`;
        this.modifyingApiEndpoint = `/api/v1/${endpoint}`;
    }
    
    async loadAllData(): Promise<ListResponse<T>> {
        return this.loadAllDataAtUrl(`/api/v1/${this.endpoint}`);
    }

    async loadDataForSearch(field: string, value: string): Promise<ListResponse<T>> {
        const query: {[key: string]: string} = {};
        query[field] = value; 
        return await this.searchData(query);
    }

    async loadExistingObject(id: string): Promise<T> {
        const url = `/api/v1/${this.endpoint}/field/id/${id}?single=true`;
        return await this.loadAllDataAtUrl(url);
    }

    abstract renderData(data: ListResponse<T>, filter: string): JSX.Element;

    abstract renderEditor(object: Partial<T>, mode: EditorMode): JSX.Element;

    protected async searchData(query: object): Promise<ListResponse<T>> {
        const url = `/api/v1/${this.endpoint}/search?sort=date&dir=desc`;
        const response = await fetch(url, {
            method: 'post',
            body: JSON.stringify(query)
        });
        // TODO Check the response for errors
        return await response.json() as ListResponse<T>;  
    }

    protected async loadAllDataAtUrl<U>(url: string): Promise<U> {
        const response = await fetch(url, {
            method: 'get'
        });
        // TODO Check the response for errors
        return await response.json() as U;
    }
}

export class ExpenseEndpoint extends BasicExpenseEndpoint<Expense> implements TimeBasedEndpoint<ListResponse<Expense>> {

    constructor() {
        super('expenses', 'Add Expense', true);
    }

    renderData(data: ListResponse<Expense>, filter: string): JSX.Element {
        return <ExpensesTable endpoint={this} expenses={data.values} filter={filter}/>;
    }

    loadDataForTime(year: number, month?: number | undefined): Promise<ListResponse<Expense>> {
        const start = this.date(year, month);
        const end = start.add(1, month === undefined ? 'year' : 'month');
        return this.searchData(this.dateRangeQuery(start, end));
    }

    loadDataForFilter(filter: string): Promise<ListResponse<Expense>> {
        return this.loadAllDataAtUrl(`/api/v1/${this.endpoint}/search/${encodeURIComponent(filter)}`);
    }
    
    renderEditor(object: Partial<Expense>, mode: EditorMode): JSX.Element {
        return <ExpenseEditor endpoint={this} initialExpense={toInitialExpense(object)} mode={mode}/>
    }

    private date(year: number, month?: number): dayjs.Dayjs {
        return dayjs().year(year).month(month ?? 0).date(1);
    }

    private dateRangeQuery(fromInclusive: dayjs.Dayjs, toExclusive: dayjs.Dayjs): object {
        return {
            and: [
                {
                    date: {
                        date: {
                            year: fromInclusive.year(),
                            month: fromInclusive.month() + 1, // Months in the Backend are 1-based
                            day: fromInclusive.date()
                        },
                        comparison: '>='
                    }
                },
                {
                    date: {
                        date: {
                            year: toExclusive.year(),
                            month: toExclusive.month() + 1, // Months in the Backend are 1-based
                            day: toExclusive.date()
                        },
                        comparison: '<'
                    }
                }
            ]
        };
    }
}

export class ScheduledExpenseEndpoint extends BasicExpenseEndpoint<ScheduledExpense> {

    constructor() {
        super('schedules', 'Add Scheduled Expense', false);
    }

    renderEditor(object: Partial<ScheduledExpense>, mode: EditorMode): JSX.Element {
        return <ScheduledExpenseEditor endpoint={this} initialExpense={toInitialExpense(object)} mode={mode}/>
    }

    renderData(data: ListResponse<ScheduledExpense>, filter: string): JSX.Element {
        return <ScheduledExpensesTable endpoint={this} expenses={data.values} filter={filter}/>;
    }
}

export class ExpenseTemplateEndpoint extends BasicExpenseEndpoint<ExpenseTemplate> {

    constructor() {
        super('templates', 'Add Expense Template', false);
    }

    renderEditor(object: Partial<Expense>, mode: EditorMode): JSX.Element {
        return <ExpenseTemplateEditor endpoint={this} initialExpense={toInitialExpense(object)} mode={mode}/>;
    }

    renderData(data: ListResponse<ExpenseTemplate>, filter: string): JSX.Element {
        return <ExpenseTemplatesTable endpoint={this} expenses={data.values} filter={filter}/>;
    }
}