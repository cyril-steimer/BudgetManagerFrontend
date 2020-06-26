import {BudgetPeriodSwitch} from './budget.period';
import {Timestamp} from './model';
import {TimestampUtil} from './model.util';

export class PeriodQuery implements BudgetPeriodSwitch<Date, {}> {

    caseMonthly(arg: Date): {} {
        return QueryUtil.monthQuery(arg);
    }

    caseYearly(arg: Date): {} {
        return QueryUtil.yearQuery(arg);
    }
}

export class QueryUtil {

    static budgetIdQuery(budgetId: string) {
        return {
            'budgetId': budgetId
        };
    }

    static andQuery(queries: any[]) {
        return {
            and: queries
        };
    }

    static orQuery(queries: any[]) {
        return {
            or: queries
        };
    }

    static notQuery(query: any) {
        return {
            not: query
        };
    }

    static yearQuery(year: Date) {
        const start = new Date(year.getFullYear(), 0);
        const end = new Date(year.getFullYear() + 1, 0);
        return QueryUtil.betweenDateQuery(start, end);
    }

    static monthQuery(month: Date) {
        const start = new Date(month.getFullYear(), month.getMonth());
        const end = new Date(month.getFullYear(), month.getMonth() + 1);
        return QueryUtil.betweenDateQuery(start, end);
    }

    static fieldQuery(field: string, value: string | { [key: string]: any }) {
        const res = {};
        res[field] = value;
        return res;
    }

    static afterOrEqualQuery(start: Date) {
        return {
            date: {
                date: QueryUtil.format(start),
                comparison: '>='
            }
        };
    }

    static beforeQuery(end: Date) {
        return {
            date: {
                date: QueryUtil.format(end),
                comparison: '<'
            }
        };
    }

    private static format(date: Date): Timestamp {
        return TimestampUtil.fromDate(date);
    }

    private static betweenDateQuery(start: Date, end: Date) {
        return this.andQuery([this.afterOrEqualQuery(start), this.beforeQuery(end)]);
    }
}
