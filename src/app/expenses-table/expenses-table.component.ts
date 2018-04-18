import { Component, OnInit, Input } from '@angular/core';
import { Expense, Sort, SubList } from '../model';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'app-expenses-table',
	templateUrl: './expenses-table.component.html',
	styleUrls: ['./expenses-table.component.css']
})
export class ExpensesTableComponent {

	@Input() expenses: Expense[] = []
	@Input() beforeEdit: BeforeEdit
	@Input() sorter: ExpenseSorter

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

	edit(expense: Expense) {
		if (this.beforeEdit) {
			this.beforeEdit.beforeEdit(expense)
		}
		this.router.navigate(["edit", "expense", expense.id])
	}
}

export interface BeforeEdit {
	beforeEdit(expense: Expense)
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