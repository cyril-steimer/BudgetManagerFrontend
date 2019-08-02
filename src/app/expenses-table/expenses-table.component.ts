import { Component, Input, AfterContentChecked } from '@angular/core';
import { Expense } from '../model';
import { Router } from '@angular/router';
import { ModelUtil } from '../model.util';
import { ExpenseType } from '../expense.service';

@Component({
	selector: 'app-expenses-table',
	templateUrl: './expenses-table.component.html',
	styleUrls: ['./expenses-table.component.css']
})
export class ExpensesTableComponent implements AfterContentChecked {

	@Input() expenses: Expense[] = []
	@Input() beforeLeave: BeforeLeave
	@Input() sorter: ExpenseSorter
	@Input() expenseType = ExpenseType.EXPENSE

	total = ModelUtil.emptyExpense();

	constructor(private router: Router) { }

	ngAfterContentChecked() {
		this.total.amount.amount = this.expenses
			.map(e => e.amount.amount)
			.reduce((a1, a2) => a1 + a2, 0);
	}

	edit(expense: Expense) {
		this.prepareToLeave();
		this.router.navigateByUrl(this.expenseType.getEditUrl(expense));
	}

	searchByTag(event: MouseEvent, tag: string) {
		this.prepareToLeave(event);
		this.router.navigateByUrl(this.expenseType.getFilterByFieldUrl('tag', tag));
	}

	searchByMethod(event: MouseEvent, method: string) {
		this.prepareToLeave(event);
		this.router.navigateByUrl(this.expenseType.getFilterByFieldUrl('method', method));
	}

	searchByCategory(event: MouseEvent, category: string) {
		this.prepareToLeave(event);
		this.router.navigateByUrl(this.expenseType.getFilterByFieldUrl('category', category));
	}

	searchByAuthor(event: MouseEvent, author: string) {
		this.prepareToLeave(event);
		this.router.navigateByUrl(this.expenseType.getFilterByFieldUrl('author', author));
	}

	private prepareToLeave(event?: MouseEvent) {
		if (event) {
			// Don't follow the href. Href necessary for style.
			event.preventDefault();
		}
		if (this.beforeLeave) {
			this.beforeLeave.beforeLeave();
		}
	}
}

export interface BeforeLeave {
	beforeLeave(): void;
}

export class SortDirection {
	dir: "asc" | "desc"
}

export class SortField {
	field: "date" | "amount" | "name" | "category"
}

export interface ExpenseSorter {
	sort(field: SortField, dir: SortDirection): void;
	removeSort(): void;
}