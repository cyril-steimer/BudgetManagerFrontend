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
			header: {
				fontSize: 18,
				bold: true
			}
		};
	}

	private createContent(): any {
		let result = [];
		result.push({
			text: 'Report',
			style: 'header'
		});
		for (let expense of this.expenses) {
			result.push(`${expense.category.name} = ${this.toString(expense.amount)} / ${this.toString(expense.budget)}`);
		}
		return result;
	}

	private toString(amount: Amount) {
		return amount.amount.toFixed(2);
	}
}
