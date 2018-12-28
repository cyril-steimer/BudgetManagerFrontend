import { Component, OnInit } from '@angular/core';
import { Text } from '@angular/compiler';
import { Expense } from '../model';
import { ExpenseService } from '../expense.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

	cards: Card[] = [];

	filteredExpenses: Expense[] = null;

	constructor(private expenseService: ExpenseService) { 
		this.initCards();
	}

	searchExpenses(text: string) {
		if (text.length == 0) {
			this.filteredExpenses = null;
		} else {
			this.expenseService.getExpenses(text)
				.subscribe(expenses => this.filteredExpenses = expenses.values);
		}
	}

	private initCards() {
		let date = new Date();
		this.cards.push(this.expenses(date));
		this.cards.push(this.budget(date));
		this.cards.push(this.newExpense());
		this.cards.push(this.newBudget());
		this.cards.push(this.importExport());
	}

	private expenses(date: Date): Card {
		return {
			title: 'Expenses',
			content: 'View the list of all expenses during a certain time frame',
			links: [
				{
					name: 'This Month',
					url: `/expenses/year/${date.getFullYear()}/month/${date.getMonth()}`
				},
				{
					name: 'This Year',
					url: `/expenses/year/${date.getFullYear()}`
				},
				{
					name: 'All Time',
					url: '/expenses'
				}
			]
		};
	}

	private budget(date: Date): Card {
		return {
			title: 'Budget',
			content: 'Check the state of your budget during the current month or year',
			links: [
				{
					name: 'This Month',
					url: `/budget/year/${date.getFullYear()}/month/${date.getMonth()}`
				},
				{
					name: 'This Year',
					url: `/budget/year/${date.getFullYear()}`
				}
			]
		};
	}

	private newExpense(): Card {
		return {
			title: 'New Expense',
			content: 'Input a new expense to the budget manager',
			links: [
				{
					name: 'Add Expense',
					url: '/add'
				}
			]
		};
	}

	private newBudget(): Card {
		return {
			title: 'New Budget',
			content: 'Add a new budget to the budget manager',
			links: [
				{
					name: 'Add Budget',
					url: '/budget/add'
				}
			]
		};
	}

	private importExport(): Card {
		return {
			title: 'Import/Export',
			content: 'Import or export all expende/budget data. The data can then be used in another instance of the budget manager',
			links: [
				{
					name: 'Import/Export',
					url: '/importexport'
				}
			]
		}
	}
}

class Card {
	title: string
	content: string
	links: Link[]
}

class Link {
	name: string
	url: string
}
