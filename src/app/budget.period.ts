import { Budget, BudgetInPeriod, MonthYearPeriod } from "./model";

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

export class MonthYearPeriodCalculator implements BudgetPeriodSwitch<Date, MonthYearPeriod> {

	caseMonthly(arg: Date): MonthYearPeriod {
		let month = arg.getMonth() + 1
		let year = arg.getFullYear()
		return {
			from: {
				month: month,
				year: year
			},
			to: {
				month: month,
				year: year
			}
		}
	}	
	
	caseYearly(arg: Date): MonthYearPeriod {
		let year = arg.getFullYear()
		return {
			from: {
				month: 1,
				year: year
			},
			to: {
				month: 12,
				year: year
			}
		}
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

export class DaysInPeriod implements BudgetPeriodSwitch<Date, number> {

	caseMonthly(arg: Date): number {
		// https://stackoverflow.com/a/1184359
		return new Date(arg.getFullYear(), arg.getMonth() + 1, 0).getDate();
	}

	caseYearly(arg: Date): number {
		// https://stackoverflow.com/a/8619946
		let startCurrentYear = new Date(arg.getFullYear(), 0);
		let startNextYear = new Date(arg.getFullYear() + 1, 0);
		return daysBetween(startCurrentYear, startNextYear);
	}
}

export class DaysSinceStart implements BudgetPeriodSwitch<Date, number> {

	//Careful: We must make sure to count the current day in both cases.
	caseMonthly(arg: Date): number {
		return arg.getDate();
	}

	caseYearly(arg: Date): number {
		let startCurrentYear = new Date(arg.getFullYear(), 0);
		let argDay = new Date(arg.getFullYear(), arg.getMonth(), arg.getDate() + 1);
		return daysBetween(startCurrentYear, argDay);
	}
}

export class NextPeriod implements BudgetPeriodSwitch<Date, Date> {
	
	caseMonthly(arg: Date): Date {
		return new Date(arg.getFullYear(), arg.getMonth() + 1)
	}

	caseYearly(arg: Date): Date {
		return new Date(arg.getFullYear() + 1, 0)
	}
}

export class PreviousPeriod implements BudgetPeriodSwitch<Date, Date> {

	caseMonthly(arg: Date): Date {
		return new Date(arg.getFullYear(), arg.getMonth() - 1)
	}

	caseYearly(arg: Date): Date {
		return new Date(arg.getFullYear() - 1, 0)
	}
}

export class EndOfPeriod implements BudgetPeriodSwitch<Date, Date> {

	caseMonthly(arg: Date): Date {
		// https://stackoverflow.com/a/1184359
		return new Date(arg.getFullYear(), arg.getMonth() + 1, 0);
	}

	caseYearly(arg: Date): Date {
		return new Date(arg.getFullYear() + 1, 0, 0);
	}
}

export function isInPeriod(switcher: BudgetPeriodSwitcher, periodStart: Date, date: Date) {
	let end = switcher.switch(new EndOfPeriod(), periodStart);
	end = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
	return periodStart.getTime() <= date.getTime()
		&& date.getTime() < end.getTime();
}

function daysBetween(start: Date, end: Date) {
	// https://stackoverflow.com/a/543152
	let day = 1000 * 60 * 60 * 24;
	return Math.round((end.getTime() - start.getTime()) / day)
}