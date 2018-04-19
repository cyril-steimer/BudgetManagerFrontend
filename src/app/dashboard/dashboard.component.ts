import { Component, OnInit } from '@angular/core';
import { Text } from '@angular/compiler';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

	cards: Card[] = [];

	constructor() { 
		this.initCards();
	}

	private initCards() {
		let date = new Date();
		this.cards.push(this.monthlyExpenses(date));
		this.cards.push(this.monthlyBudget(date));
		this.cards.push(this.yearlyExpenses(date));
		this.cards.push(this.yearlyBudget(date));
	}

	private monthlyExpenses(date: Date): Card {
		let month = date.getMonthName();
		return {
			title: `Expenses in ${month} ${date.getFullYear()}`,
			content: `List of all expenses in the month ${month}, ${date.getFullYear()}`,
			linkName: 'View Expenses',
			linkUrl: `/expenses/year/${date.getFullYear()}/month/${date.getMonth()}`
		}
	}

	private monthlyBudget(date: Date): Card {
		let month = date.getMonthName();
		return {
			title: `Budget in ${month} ${date.getFullYear()}`,
			content: `Check your budget for the month ${month}, ${date.getFullYear()}`,
			linkName: 'View Budget',
			linkUrl: `/budget/year/${date.getFullYear()}/month/${date.getMonth()}`
		}
	}

	private yearlyExpenses(date: Date): Card {
		return {
			title: `Expenses in ${date.getFullYear()}`,
			content: `List of all expenses in the year ${date.getFullYear()}`,
			linkName: 'View Expenses',
			linkUrl: `/expenses/year/${date.getFullYear()}`
		}
	}

	private yearlyBudget(date: Date): Card {
		return {
			title: `Budget in ${date.getFullYear()}`,
			content: `Check your budget for the year ${date.getFullYear()}`,
			linkName: 'View Budget',
			linkUrl: `/budget/year/${date.getFullYear()}`
		}
	}
}

class Card {
	title: string
	content: string
	linkName: string
	linkUrl: string
}
