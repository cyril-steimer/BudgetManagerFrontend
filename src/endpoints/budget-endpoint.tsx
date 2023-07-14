import {BudgetEditor} from "../components/Budget-Editor";
import {BudgetTable} from "../components/Budget-Table";
import {Budget, BudgetInPeriod, BudgetInPeriodWithExpenses} from "../model/budget";
import {DECEMBER, JANUARY} from "../model/common";
import {ListResponse} from "../model/responses";
import {EditorMode, ModifyingEndpoint, QueryingEndpoint, TimeBasedEndpoint} from "./endpoint";
import {ExpenseEndpoint} from "./expense-endpoints";

export class BudgetEndpoint implements QueryingEndpoint<BudgetInPeriodWithExpenses[]>, TimeBasedEndpoint<BudgetInPeriodWithExpenses[]>, ModifyingEndpoint<Budget> {
    
    readonly endpoint = 'budget';
    readonly supportsTimeBasedNavigation = true;
    readonly supportsViewAll = false;
    readonly supportsSimpleSearch = false;
    readonly supportsFiltering = false;
    readonly timeBasedPathPrefix = 'budget';

    readonly addText = 'Add Budget';
    readonly addPath = 'add/budget';
    readonly editText = 'Edit Budget';
    readonly editPathPrefix = 'edit/budget';
    readonly modifyingApiEndpoint = '/api/v1/budget';

    renderData(data: BudgetInPeriodWithExpenses[], filter: string): JSX.Element {
        return <BudgetTable budgets={data}/>;
    }

    async loadExistingObject(id: string): Promise<Budget> {
        const url = `/api/v1/budget/category/${encodeURIComponent(id)}`;
        const response = await fetch(url);
        return await response.json() as Budget;
    }

    renderEditor(object: Partial<Budget>, mode: EditorMode): JSX.Element {
        return <BudgetEditor endpoint={this} initialBudget={object} mode={mode}/>
    }

    async loadDataForTime(year: number, month?: number | undefined): Promise<BudgetInPeriodWithExpenses[]> {
        const budgets = (await this.getBudgetsForTime(year, month)).values;
        const expenses = (await new ExpenseEndpoint().loadDataForTime(year, month)).values;
        const budgetsWithExpenses: BudgetInPeriodWithExpenses[] = [];
        for (let budget of budgets) {
            let filteredExpenses = expenses.filter(exp => exp.category.name === budget.category.name);
            budgetsWithExpenses.push(new BudgetInPeriodWithExpenses(budget, filteredExpenses));
        }
        const allCategories = budgets.map(b => b.category.name);
        const notBudgeted = expenses.filter(e => allCategories.indexOf(e.category.name) < 0);
        if (notBudgeted.length > 0) {
            budgetsWithExpenses.push(new BudgetInPeriodWithExpenses({
                amount: {
                    amount: 0
                },
                category: {
                    name: 'Not Budgeted'
                }
            }, notBudgeted));
        }
        return budgetsWithExpenses;
    }
    
    private async getBudgetsForTime(year: number, month?: number | undefined): Promise<ListResponse<BudgetInPeriod>> {
        const query = this.dateRangeQuery(year, month);
        const url = '/api/v1/budget/period';
        const response = await fetch(url, {
            method: 'post',
            body: JSON.stringify(query)
        });
        // TODO Check the response for errors
        return await response.json() as ListResponse<BudgetInPeriod>;  
    }

    private dateRangeQuery(year: number, month?: number): object {
        return {
            from: {
                month: (month ?? JANUARY) + 1, // Months in the Backend are 1-based
                year: year
            },
            to: {
                month: (month ?? DECEMBER) + 1, // Months in the Backend are 1-based
                year: year
            }
        };
    }
}