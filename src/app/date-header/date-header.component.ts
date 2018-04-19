import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BudgetPeriodSwitch, BudgetPeriod, BudgetPeriodSwitcher, DateExtractor } from '../budget.period';
import { dashCaseToCamelCase } from '@angular/compiler/src/util';
import * as $ from 'jquery'

export interface ExpenseSearch {
	search(text: string): void
} 

@Component({
	selector: 'app-date-header',
	templateUrl: './date-header.component.html',
	styleUrls: ['./date-header.component.css']
})
export class DateHeaderComponent implements OnInit {

	@Input() date: Date
	@Input() switcher: BudgetPeriodSwitcher
	@Input() urlPrefix: string
	@Input() search: ExpenseSearch

	nextDateLink: DateLink
	dateLink: DateLink
	prevDateLink: DateLink
	
	parent: DateLink
	children: DateLink[]

	constructor(private route: ActivatedRoute) {}

	ngOnInit() {
		this.update(this.date)
		this.route.params.subscribe(params => this.updateDate(params))
	}

	doSearch(text: string) {
		if (this.search) {
			this.search.search(text);
		}
	}

	private updateDate(params: any) {
		let date = this.switcher.switch(new DateExtractor(), params)
		this.update(date)
	}

	private update(date: Date) {
		this.dateLink = DateLink.create(this.switcher, date)

		let nextDate = this.switcher.switch(new NextDate(), date)
		this.nextDateLink = DateLink.create(this.switcher, nextDate)

		let prevDate = this.switcher.switch(new PreviousDate(), date)
		this.prevDateLink = DateLink.create(this.switcher, prevDate)

		this.parent = this.switcher.switch(new ParentLink(), date)
		this.children = this.switcher.switch(new ChildrenLinks(), date)
		
		$(".dropdown-button").dropdown({
			constrainWidth: false,
			hover: true
		})
	}
}

class DateLink {
	label: string
	urlSuffix: string

	static create(switcher: BudgetPeriodSwitcher | BudgetPeriod, date: Date) {
		if (!(switcher instanceof BudgetPeriodSwitcher)) {
			switcher = new BudgetPeriodSwitcher(switcher)
		}
		return switcher.switch(new DateLinkFactory(), date)
	}
}

class ChildrenLinks implements BudgetPeriodSwitch<Date, DateLink[]> {
 
	caseMonthly(arg: Date): DateLink[] {
		return null //There is no finer view than 'monthly'
	}

	caseYearly(arg: Date): DateLink[] {
		let result = []
		for (let month = 0; month < 12; month++) {
			let date = new Date(arg.getFullYear(), month)
			result.push(DateLink.create(BudgetPeriod.MONTHLY, date))
		}
		return result
	}
}

class ParentLink implements BudgetPeriodSwitch<Date, DateLink> {

	caseMonthly(arg: Date): DateLink {
		let year = new Date(arg.getFullYear(), 0)
		return DateLink.create(BudgetPeriod.YEARLY, year)
	}

	caseYearly(arg: Date): DateLink {
		return null //There is no coarser view than 'yearly'
	}
}

class DateLinkFactory implements BudgetPeriodSwitch<Date, DateLink> {

	caseMonthly(arg: Date): DateLink {
		return {
			label: `${arg.getMonthName()} ${arg.getFullYear()}`,
			urlSuffix: `year/${arg.getFullYear()}/month/${arg.getMonth()}`
		}
	}

	caseYearly(arg: Date): DateLink {
		return {
			label: `${arg.getFullYear()}`,
			urlSuffix: `year/${arg.getFullYear()}`
		}
	}
}

class NextDate implements BudgetPeriodSwitch<Date, Date> {

	caseMonthly(arg: Date): Date {
		return new Date(arg.getFullYear(), arg.getMonth() + 1)
	}

	caseYearly(arg: Date): Date {
		return new Date(arg.getFullYear() + 1, 0)
	}
}

class PreviousDate implements BudgetPeriodSwitch<Date, Date> {

	caseMonthly(arg: Date): Date {
		return new Date(arg.getFullYear(), arg.getMonth() - 1)
	}

	caseYearly(arg: Date): Date {
		return new Date(arg.getFullYear() - 1, 0)
	}
}
