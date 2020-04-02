import {Budget, Timestamp} from './model';
import {BudgetPeriod, BudgetPeriodSwitcher} from './budget.period';

export interface Order {
    order: number;
}

export interface Title {
    title: string;
}

export interface BudgetListExpenseFilter {
    budgets: Budget[];
}

export interface BudgetView {
    id: string;
    order: Order;
    title: Title;
    filter?: BudgetListExpenseFilter;
    period: BudgetPeriod;
    start?: Timestamp;
    end?: Timestamp;
}

export function getViewUrl(view: BudgetView): string {
    // TODO What if start/end is set and not within the bounds?
    const date = new Date();
    return new BudgetPeriodSwitcher(view.period).switch<void, string>({
        caseMonthly(arg: void): string {
            return `/budget/view/${view.id}/year/${date.getFullYear()}/month/${date.getMonth()}`;
        },

        caseYearly(arg: void): string {
            return `/budget/view/${view.id}/year/${date.getFullYear()}`;
        }
    }, null);
}
