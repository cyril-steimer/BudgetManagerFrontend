import { Component, OnInit, Input } from '@angular/core';
import { CategoryExpenses, Amount } from '../model';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdffonts from 'pdfmake/build/vfs_fonts';

pdfmake.vfs = pdffonts.pdfMake.vfs;

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
			styles: this.createStyles(),
			defaultStyle: this.createDefaultStyle()
		};
	}

	private createDefaultStyle():any {
		return {
			fontSize: 12,
			bold: false
		};
	}

	private createStyles(): any {
		return {
			h1: {
				fontSize: 18,
				bold: true,
				margin: [0, 0, 0, 10]
			},
			h2: {
				fontSize: 16,
				bold: true,
				margin: [0, 0, 0, 5]
			},
			tableHeader: {
				fontSize: 14,
				bold: true
			}
		};
	}

	private createContent(): any {
		let result = [];
		result.push({
			text: 'Report',
			style: 'h1'
		});
		result.push({
			text: 'Summary',
			style: 'h2'
		});
		result.push({
			table: this.createSummaryTable()
		});
		return result;
	}

	private createSummaryTable(): any {
		let body = [[this.th('Category'), this.th('Spent'), this.th('Budget'), this.th('%')]];
		for (let expense of this.expenses) {
			body.push([
				expense.category.name, 
				this.toString(expense.amount), 
				this.toString(expense.budget),
				this.fraction(expense.amount, expense.budget)
			]);

		}
		return {
			widths: [100, 100, 100, 100],
			headerRows: 1,
			body: body
		};
	}

	private th(content: string): any {
		return {
			text: content,
			style: 'tableHeader'
		};
	}

	private fraction(amt1: Amount, amt2: Amount) {
		return ((amt1.amount / amt2.amount) * 100).toFixed(2);
	}

	private toString(amount: Amount) {
		return amount.amount.toFixed(2);
	}
}
