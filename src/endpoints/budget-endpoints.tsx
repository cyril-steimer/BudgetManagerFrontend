import {BudgetTable} from "../components/Budget-Table";
import {BudgetInPeriod, BudgetInPeriodWithExpenses} from "../model/budget";
import {DECEMBER, JANUARY} from "../model/common";
import {ListResponse} from "../model/responses";
import {Endpoint, TimeBasedEndpoint} from "./endpoint";
import {ExpenseEndpoint} from "./expense-endpoints";

export class BudgetInPeriodEndpoint implements Endpoint<BudgetInPeriodWithExpenses[]>, TimeBasedEndpoint<BudgetInPeriodWithExpenses[]> {
    readonly supportsTimeBasedNavigation = true;
    readonly supportsViewAll = false;
    readonly supportsSimpleSearch = false;
    readonly supportsFiltering = false;
    readonly timeBasedPathPrefix = 'budget';

    renderData(data: BudgetInPeriodWithExpenses[], filter: string): JSX.Element {
        return <BudgetTable budgets={data}/>;
    }

    async loadDataForTime(year: number, month?: number | undefined): Promise<BudgetInPeriodWithExpenses[]> {
        const budgets = (await this.getBudgetsForTime(year, month)).values;
        const expenses = (await new ExpenseEndpoint().loadDataForTime(year, month)).values;
        const budgetsWithExpenses: BudgetInPeriodWithExpenses[] = [];
        for (let budget of budgets) {
            let filteredExpenses = expenses.filter(exp => exp.category.name === budget.category.name);
            budgetsWithExpenses.push(new BudgetInPeriodWithExpenses(budget, filteredExpenses));
        }
        // TODO Unbudgeted expenses
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