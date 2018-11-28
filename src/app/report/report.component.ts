import { Component, OnInit, Input } from '@angular/core';
import { CategoryExpenses, Amount, Category, Timestamp } from '../model';
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

@Component({
	selector: 'app-report',
	templateUrl: './report.component.html',
	styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {

	@Input()
	expenses: ExpensesPerCategory

	private datePipe = new DatePipe('en-US');

	constructor() { }

	ngOnInit() {
	}

	createReport() {
		pdfmake.createPdf(this.createDocumentDefinition()).download('report.pdf');
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
		let result = [];
		result.push(this.applyStyle('Report', H1));
		result.push(this.applyStyle('Summary', H2));
		result.push({
			table: this.createSummaryTable()
		});
		result.push(this.applyStyle('Details', H2));
		for (let category of this.expenses.getAllExpenses()) {
			result.push(this.applyStyle(category.category.name, H3));
			result.push({
				table: this.createDetailsTable(category)
			});
		}
		return result;
	}

	private createSummaryTable(): any {
		let body = [this.applyStyleToAll(['Category', 'Spent', 'Budget', '%'], TH)];
		for (let expense of this.expenses.getAllExpenses()) {
			body.push(this.createSummaryRow(expense, NONE));
		}
		body.push(this.createSummaryRow(this.expenses.getTotal(), TH));
		return {
			widths: ['*', '*', '*', '*'],
			body: body
		};
	}

	private createSummaryRow(row: CategoryExpenses, style: Style): any[] {
		style = this.mergeStyles(style, row.amount.amount > row.budget.amount ? RED : NONE);
		return this.applyStyleToAll([
			row.category.name,
			this.toString(row.amount), 
			this.toString(row.budget),
			this.fraction(row.amount, row.budget)], style);
	}

	private createDetailsTable(expenses: CategoryExpenses): any {
		let body = [this.applyStyleToAll(['Name', 'Amount', 'Date', 'Payment Method', 'Tags'], TH)];
		for (let expense of expenses.expenses) {
			let method = expense.method == null ? '' : expense.method.name;
			let tags = expense.tags.map((tag) => tag.name).join(', ');
			body.push([
				expense.name.name, 
				this.toString(expense.amount), 
				this.format(expense.date),
				method,
				tags
			]);
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
