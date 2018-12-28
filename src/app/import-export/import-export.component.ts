import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../expense.service';
import { BudgetService } from '../budget.service';
import { Expense, Budget } from '../model';
import * as saveAs from 'file-saver';

const VERSION = '1.0';

@Component({
	selector: 'app-import-export',
	templateUrl: './import-export.component.html',
	styleUrls: ['./import-export.component.css']
})
export class ImportExportComponent implements OnInit {

	constructor(
		private expenseService: ExpenseService, 
		private budgetService: BudgetService) { }

	ngOnInit() {

	}

	export() {
		this.fetchExpenses();
	}

	private fetchExpenses () {
		this.expenseService.getExpenses()
			.subscribe((res) => this.fetchBudgets(res.values));
	}

	private fetchBudgets (expenses: Expense[]) {
		this.budgetService.getBudgets()
			.subscribe((res) => this.downloadFile(expenses, res.values));
	}

	private downloadFile (expenses: Expense[], budgets: Budget[]) {
		let content = {
			version: VERSION,
			expenses: expenses,
			budgets: budgets
		};
		let json = JSON.stringify(content, null, 4);
		let blob = new Blob([json], {type: 'applicatjon/json;charset=utf-8'});
		saveAs.saveAs(blob, 'export.json');
	}
}
