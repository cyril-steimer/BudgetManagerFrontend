import { BudgetPeriodSwitcher, BudgetPeriodSwitch } from "./budget.period";
import { Category, Timestamp } from "./model";
import { TimestampUtil } from "./model.util";

export class PeriodQuery implements BudgetPeriodSwitch<Date, {}> {
 
	caseMonthly(arg: Date): {} {
		return QueryUtil.monthQuery(arg)
	}

	caseYearly(arg: Date): {} {
		return QueryUtil.yearQuery(arg)
	}
}

export class QueryUtil {

	static yearQuery(year: Date) {
		let start = new Date(year.getFullYear(), 0);
		let end = new Date(year.getFullYear() + 1, 0);
		return QueryUtil.betweenDateQuery(start, end)
	}
	
	static monthQuery(month: Date) {
		let start = new Date(month.getFullYear(), month.getMonth());
		let end = new Date(month.getFullYear(), month.getMonth() + 1);
		return QueryUtil.betweenDateQuery(start, end)
	}

	static fieldQuery(field: string, value: string | {[key: string]: any}) {
		let res = {};
		res[field] = value;
		return res;
	}

	private static format(date: Date): Timestamp {
		return TimestampUtil.fromDate(date)
	}
	
	private static betweenDateQuery(start: Date, end: Date) {
		return {
			and: [
				{
					date: {
						date: QueryUtil.format(start),
						comparison: ">="
					}
				},
				{
					date: {
						date: QueryUtil.format(end),
						comparison: "<"
					}
				}
			]
		}
	}
}