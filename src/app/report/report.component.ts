import { Component, OnInit, Input } from '@angular/core';
import { CategoryExpenses, Amount, Category, Timestamp, Expense, ActualExpense } from '../model';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdffonts from 'pdfmake/build/vfs_fonts';
import { DatePipe } from '@angular/common';
import { ExpensesPerCategory } from '../model.util';

pdfmake.vfs = pdffonts.pdfMake.vfs;

const H1 = {
	fontSize: 18,
	bold: true,
	margin: [0, 10, 0, 10]
};

const H2 = {
	fontSize: 16,
	bold: true,
	margin: [0, 5, 0, 5]
};

const H3 = {
	fontSize: 14,
	bold: true,
	margin: [0, 3, 0, 3]
};

const TH = {
	fontSize: 14,
	bold: true
};

const RED = {
	color: 'red'
};

const NONE = {};

type Style = {[key: string]: any};

abstract class Config {
	
	constructor(
		readonly name: string,
		public selected: boolean) { }

	static filterSelected<T extends Config>(configs: T[]): T[] {
		return configs.filter((c) => c.selected);
	}
}

class ContentConfig extends Config {
	
	constructor(
		name: string,
		selected: boolean,
		private content: CategoryExpenses,
		public readonly total: boolean) {
			super(name, selected)
	}

	getContent() {
		return this.content
	}
}

class ColumnConfig<T> extends Config {

	constructor(
		name: string,
		selected: boolean,
		private column: (val: T) => string) {
			super(name, selected);
	}

	getColumnValue(val: T) {
		return this.column(val)
	}
}

@Component({
	selector: 'app-report',
	templateUrl: './report.component.html',
	styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

	@Input()
	expenses: ExpensesPerCategory

	summaryRows: ContentConfig[]
	summaryColumns: ColumnConfig<CategoryExpenses>[]

	addDetail = false;
	detailTables: ContentConfig[]
	detailColumns: ColumnConfig<ActualExpense>[]

	private datePipe = new DatePipe('en-US');

	constructor() { }

	ngOnInit() {
		// Content Configs
		this.summaryRows = this.createContentConfig(true)
		this.detailTables = this.createContentConfig(false)

		// Column Configs
		this.summaryColumns = this.createSummaryColumns()
		this.detailColumns = this.createDetailColumns()
	}

	createReport() {
		pdfmake.createPdf(this.createDocumentDefinition()).download('report.pdf');
	}

	private createSummaryColumns() {
		return [
			new ColumnConfig<CategoryExpenses>('Category', true, (val) => val.category.name),
			new ColumnConfig<CategoryExpenses>('Spent', true, (val) => this.toString(val.amount)),
			new ColumnConfig<CategoryExpenses>('Budget', true, (val) => this.toString(val.budget)),
			new ColumnConfig<CategoryExpenses>('%', true, (val) => this.fraction(val.amount, val.budget))
		]
	}

	private createDetailColumns() {
		return [
			new ColumnConfig<ActualExpense>('Name', true, (val) => val.name.name),
			new ColumnConfig<ActualExpense>('Amount', true, (val) => this.toString(val.amount)),
			new ColumnConfig<ActualExpense>('Date', true, (val) => this.format(val.date)),
			new ColumnConfig<ActualExpense>('Payment Method', true, (val) => val.method == null ? '' : val.method.name),
			new ColumnConfig<ActualExpense>('Tags', true, (val) => val.tags.map((tag) => tag.name).join(', '))
		]
	}

	private createContentConfig(includeTotal: boolean) {
		let res = []
		for (let expense of this.expenses.getAllExpenses()) {
			res.push(new ContentConfig(expense.category.name, true, expense, false))
		}
		let total = this.expenses.getTotal()
		res.push(new ContentConfig(total.category.name, includeTotal, total, true))
		return res
	}

	private createDocumentDefinition(): any {
		return {
			content: this.createContent(),
			defaultStyle: this.createDefaultStyle()
		};
	}

	private createDefaultStyle():any {
		return {
			fontSize: 12,
			bold: false
		};
	}

	private createContent(): any {
		let result = []
		result.push(this.applyStyle('Report', H1))
		let summaryRows = Config.filterSelected(this.summaryRows)
		if (summaryRows.length > 0) {
			result.push(this.applyStyle('Summary', H2));
			result.push({
				table: this.createSummaryTable(summaryRows)
			});
		}
		let detailTables = Config.filterSelected(this.detailTables)
		if (this.addDetail && detailTables.length > 0) {
			result.push(this.applyStyle('Details', H2))
			for (let table of detailTables) {
				result.push(this.applyStyle(table.getContent().category.name, H3));
				result.push({
					table: this.createDetailsTable(table.getContent())
				})
			}
		}
		return result
	}

	private createSummaryTable(rows: ContentConfig[]): any {
		let columns = Config.filterSelected(this.summaryColumns)
		let body = [this.applyStyleToAll(columns.map((col) => col.name), TH)];
		for (let row of rows) {
			let style = row.total ? TH : NONE;
			body.push(this.createSummaryRow(row.getContent(), style));
		}
		return {
			widths: ['*', '*', '*', '*'],
			body: body
		};
	}

	private createSummaryRow(row: CategoryExpenses, style: Style): any[] {
		style = this.mergeStyles(style, row.amount.amount > row.budget.amount ? RED : NONE);
		return this.applyStyleToAll(
			Config.filterSelected(this.summaryColumns).map((col) => col.getColumnValue(row)),
			style);
	}

	private createDetailsTable(expenses: CategoryExpenses): any {
		let columns = Config.filterSelected(this.detailColumns)
		let body = [this.applyStyleToAll(columns.map((col) => col.name), TH)];
		for (let expense of expenses.expenses) {
			let content = columns.map((col) => col.getColumnValue(expense))
			body.push(content)
		}
		return {
			widths: ['*', '*', '*', '*', '*'],
			body: body
		};
	}

	private applyStyleToAll(contents: string[], style: Style): any[] {
		return contents.map((val) => this.applyStyle(val, style));
	}

	private applyStyle(content: string, style: Style): any {
		let res = Object.assign({}, style);
		res.text = content;
		return res;
	}

	private mergeStyles(s1: Style, s2: Style): Style {
		let res = Object.assign({}, s1);
		return Object.assign(res, s2);
	}

	private fraction(amt1: Amount, amt2: Amount) {
		if (amt2.amount == 0) {
			return '-';
		}
		return ((amt1.amount / amt2.amount) * 100).toFixed(2);
	}

	private format(date: Timestamp) {
		return this.datePipe.transform(date.timestamp, 'dd.MM.yyyy');
	}

	private toString(amount: Amount) {
		return amount.amount.toFixed(2);
	}
}
