import {Budget, Timestamp} from './model';
import {BudgetPeriod, BudgetPeriodSwitch, BudgetPeriodSwitcher} from './budget.period';

export interface Order {
    order: number;
}

export interface Title {
    title: string;
}

export enum ViewPeriod {
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
    FIXED = 'fixed'
}

export enum ViewType {
    BUDGET_VIEW = 'budgetView',
    EXPENSE_VIEW = 'expenseView'
}

export interface BudgetFilter {
    blacklist?: Budget[];
    whitelist?: Budget[];
}

export interface View {
    id: string;
    type: ViewType;
    order: Order;
    title: Title;
    budgetFilter?: BudgetFilter;
    period: ViewPeriod;
    drillDownViewId?: string;
    drillUpViewId?: string;
    start?: Timestamp;
    end?: Timestamp;
}

export function toBudgetPeriod(viewPeriod: ViewPeriod): BudgetPeriod {
    switch (viewPeriod) {
        case ViewPeriod.MONTHLY:
            return BudgetPeriod.MONTHLY;
        case ViewPeriod.YEARLY:
            return BudgetPeriod.YEARLY;
        case ViewPeriod.FIXED:
            throw new Error('Fixed budget periods are not supported yet');
    }
}

class GetViewLabelSwitch implements BudgetPeriodSwitch<Date, string> {

    caseMonthly(arg: Date): string {
        return `${arg.getMonthName()} ${arg.getFullYear()}`;
    }

    caseYearly(arg: Date): string {
        return `${arg.getFullYear()}`;
    }
}

export function getViewLabel(view: View, date: Date): string {
    if (view.period === ViewPeriod.FIXED) {
        return view.title.title;
    }
    const switcher = new BudgetPeriodSwitcher(toBudgetPeriod(view.period));
    return switcher.switch(new GetViewLabelSwitch(), date);
}

export function getViewUrl(view: View, date: Date): string {
    // TODO What if start/end is set and not within the bounds?
    let prefix = view.type === ViewType.BUDGET_VIEW ? '/budget/view' : '/expenses/view';
    prefix = `${prefix}/${view.id}`;
    switch (view.period) {
        case ViewPeriod.FIXED:
            return prefix;
        case ViewPeriod.MONTHLY:
            return `${prefix}/year/${date.getFullYear()}/month/${date.getMonth()}`;
        case ViewPeriod.YEARLY:
            return `${prefix}/year/${date.getFullYear()}`;
    }
}

export function extractDate(params: { [key: string]: string; }): Date {
    if (params.year && params.month) {
        return new Date(+params.year, +params.month);
    } else if (params.year) {
        return new Date(+params.year, 0);
    }
    return null;
}
