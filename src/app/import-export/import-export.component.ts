import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../expense.service';
import { BudgetService } from '../budget.service';
import { Expense, Budget } from '../model';
import * as saveAs from 'file-saver';

const VERSION = '1.0';

interface ImportExport {
	version: string
	expenses: Expense[]
	budgets: Budget[]
}

@Component({
	selector: 'app-import-export',
	templateUrl: './import-export.component.html',
	styleUrls: ['./import-export.component.css']
})
export class ImportExportComponent implements OnInit {

	constructor (
		private expenseService: ExpenseService, 
		private budgetService: BudgetService) { }

	ngOnInit () {

	}

	export () {
		this.fetchExpenses();
	}

	import () {
		let file = this.getFileToImport();
		if (file == null) {
			alert('No file selected');
			return;
		}
		let reader = new FileReader();
		reader.onload = () => this.checkContent(reader.result as string);
		reader.readAsText(file);
	}

	private checkContent (text: string) {
		let content = JSON.parse(text) as ImportExport;
		if (content.version != null && content.expenses != null && content.budgets != null) {
			this.importExpenses(content, 0);
		}
	}

	private importExpenses (content: ImportExport, index: number) {
		if (index >= content.expenses.length) {
			this.importBudgets(content, 0);
		}
		this.expenseService.addExpense(content.expenses[index])
			.subscribe(() => this.importExpenses(content, index + 1));
	}

	private importBudgets (content: ImportExport, index: number) {
		if (index >= content.budgets.length) {
			alert('Import is done!');
		}
		this.budgetService.addBudget(content.budgets[index])
			.subscribe(() => this.importBudgets(content, index + 1));
	}

	private getFileToImport () {
		let input = document.getElementById('import-file') as HTMLInputElement;
		return input.files.length == 0 ? null : input.files[0];
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
		let content: ImportExport = {
			version: VERSION,
			expenses: expenses,
			budgets: budgets
		};
		let json = JSON.stringify(content, null, 4);
		let blob = new Blob([json], {type: 'applicatjon/json;charset=utf-8'});
		saveAs.saveAs(blob, 'export.json');
	}
}
