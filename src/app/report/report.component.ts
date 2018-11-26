import { Component, OnInit, Input } from '@angular/core';
import { CategoryExpenses, Amount, Category } from '../model';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdffonts from 'pdfmake/build/vfs_fonts';

pdfmake.vfs = pdffonts.pdfMake.vfs;

const H1 = {
	fontSize: 18,
	bold: true,
	margin: [0, 0, 0, 10]
};

const H2 = {
	fontSize: 16,
	bold: true,
	margin: [0, 0, 0, 5]
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
	expenses: CategoryExpenses[]

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
		return result;
	}

	private createSummaryTable(): any {
		let body = [this.applyStyleToAll(['Category', 'Spent', 'Budget', '%'], TH)];
		for (let expense of this.expenses) {
			// TODO Is there a better way to get the 'total' row?
			let style = expense.category.name == 'Total' ? TH : NONE;
			style = this.mergeStyles(style, expense.amount.amount > expense.budget.amount ? RED : NONE);
			body.push(this.applyStyleToAll([
				expense.category.name, 
				this.toString(expense.amount), 
				this.toString(expense.budget),
				this.fraction(expense.amount, expense.budget)], style));
		}
		return {
			widths: ['*', '*', '*', '*'],
			body: body
		};
	}

	private applyStyleToAll(contents: string[], style: Style) {
		return contents.map((val) => this.applyStyle(val, style));
	}

	private applyStyle(content: string, style: Style) {
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

	private toString(amount: Amount) {
		return amount.amount.toFixed(2);
	}
}
