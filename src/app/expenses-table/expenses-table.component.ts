import { Component, OnInit, Input, AfterContentChecked } from '@angular/core';
import { Expense, Sort, SubList } from '../model';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ModelUtil } from '../model.util';

@Component({
	selector: 'app-expenses-table',
	templateUrl: './expenses-table.component.html',
	styleUrls: ['./expenses-table.component.css']
})
export class ExpensesTableComponent implements AfterContentChecked {

	@Input() expenses: Expense[] = []
	@Input() beforeLeave: BeforeLeave
	@Input() sorter: ExpenseSorter

	total = ModelUtil.emptyExpense();

	private directions: SortDirection[] = [
		{ dir: "asc" },
		{ dir: "desc" }
	]

	private fields: SortField[] = [
		{ field: "name" },
		{ field: "category" },
		{ field: "date" },
		{ field: "amount" }
	]

	constructor(private router: Router) { }

	ngAfterContentChecked() {
		this.total.amount.amount = this.expenses
			.map(e => e.amount.amount)
			.reduce((a1, a2) => a1 + a2, 0);
	}

	edit(expense: Expense) {
		this.prepareToLeave();
		this.router.navigate(["edit", "expense", expense.id])
	}

	searchByTag(event: MouseEvent, tag: string) {
		event.preventDefault(); // Don't follow the href. Href necessary for style.
		this.prepareToLeave();
		this.router.navigate(["expenses", "tag", tag])
	}

	prepareToLeave() {
		if (this.beforeLeave) {
			this.beforeLeave.beforeLeave();
		}
	}
}

export interface BeforeLeave {
	beforeLeave();
}

export class SortDirection {
	dir: "asc" | "desc"
}

export class SortField {
	field: "date" | "amount" | "name" | "category"
}

export interface ExpenseSorter {
	sort(field: SortField, dir: SortDirection)
	removeSort()
}