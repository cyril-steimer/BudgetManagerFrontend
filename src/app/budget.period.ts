import { Budget } from "./model";

export enum BudgetPeriod {
	MONTHLY = "monthly",
	YEARLY = "yearly"
}

export interface BudgetPeriodSwitch<A, R> {

	caseMonthly(arg: A): R

	caseYearly(arg: A): R
}

export class BudgetPeriodSwitcher {
	constructor(private period: BudgetPeriod) {}

	switch<A, R>(mySwitch: BudgetPeriodSwitch<A, R>, arg: A): R {
		if (this.period == BudgetPeriod.MONTHLY) {
			return mySwitch.caseMonthly(arg)
		} else if (this.period == BudgetPeriod.YEARLY) {
			return mySwitch.caseYearly(arg)
		}
		throw Error("The budget period '" + this.period + "' is invalid")
	}

	getPeriod() {
		return this.period
	}
}

export class DateExtractor implements BudgetPeriodSwitch<{[key: string]: string}, Date> {
	
	static getBudgetPeriod(params: { [key: string]: string; }) {
		if (params.month) {
			return BudgetPeriod.MONTHLY
		} else if (params.year) {
			return BudgetPeriod.YEARLY
		}
		return null
	}

	caseMonthly(params: { [key: string]: string; }): Date {
		return new Date(+params.year, +params.month);
	}

	caseYearly(params: { [key: string]: string; }): Date {
		return new Date(+params.year, 0);
	}
}

class BudgetToYearly implements BudgetPeriodSwitch<Budget, Budget> {

	caseMonthly(arg: Budget): Budget {
		arg.amount.amount = arg.amount.amount * 12
		return arg
	}

	caseYearly(arg: Budget): Budget {
		return arg
	}
}

class YearlyToPeriod implements BudgetPeriodSwitch<Budget, Budget> {

	caseMonthly(arg: Budget): Budget {
		arg.amount.amount = arg.amount.amount / 12
		arg.period = BudgetPeriod.MONTHLY
		return arg
	}

	caseYearly(arg: Budget): Budget {
		arg.period = BudgetPeriod.YEARLY
		return arg
	}
}

export class BudgetConverter {

	convert(budget: Budget, period: BudgetPeriod): Budget {
		let yearly = new BudgetPeriodSwitcher(budget.period)
			.switch(new BudgetToYearly(), budget)
		return new BudgetPeriodSwitcher(period)
			.switch(new YearlyToPeriod(), yearly)
	}
}

export class NumberOfDays implements BudgetPeriodSwitch<Date, number> {

	caseMonthly(arg: Date): number {
		// https://stackoverflow.com/a/1184359
		return new Date(arg.getFullYear(), arg.getMonth() + 1, 0).getDate();
	}

	caseYearly(arg: Date): number {
		// https://stackoverflow.com/a/8619946
		let startCurrentYear = new Date(arg.getFullYear(), 0);
		let startNextYear = new Date(arg.getFullYear() + 1, 0);
		return daysBetween(startCurrentYear, startNextYear);
		return (startNextYear.getTime() - startCurrentYear.getTime())
			/ (1000 * 60 * 60 * 24)
	}
}

export class DaysSinceStart implements BudgetPeriodSwitch<Date, number> {

	caseMonthly(arg: Date): number {
		return arg.getDate() - 1;
	}

	caseYearly(arg: Date): number {
		let startCurrentYear = new Date(arg.getFullYear(), 0);
		return daysBetween(startCurrentYear, arg);
	}
}

function daysBetween(start: Date, end: Date) {
	// https://stackoverflow.com/a/543152
	let day = 1000 * 60 * 60 * 24;
	return Math.round((end.getTime() - start.getTime()) / day)
}