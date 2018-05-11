import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Expense, Budget, CategoryExpenses, Category } from '../model';
import { ExpenseService } from '../expense.service';
import { BudgetService } from '../budget.service';
import { PeriodQuery } from '../query.util';
import { ModelUtil, CategoryExpensesCalculator } from '../model.util';
import { BeforeLeave } from '../expenses-table/expenses-table.component';
import { BudgetPeriod, BudgetPeriodSwitch, BudgetPeriodSwitcher, DateExtractor, NumberOfDays, DaysSinceStart } from '../budget.period';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import { ChartDataSets } from 'chart.js';
import { range, newFilledArray } from '../util';

@Component({
	selector: 'app-budget',
	templateUrl: './budget.component.html',
	styleUrls: ['./budget.component.css']
})
export class BudgetComponent implements OnInit, BeforeLeave {

	modalOptions: NgbModalOptions = {
		size: 'lg',
		centered: true
	};
	modal: NgbModalRef

	expensesForTable: CategoryExpenses[]

	detail: CategoryExpenses

	callback = this

	pieChartData: number[]
	pieChartLabels: string[]

	lineCharts: CategoryExpensesLineChartData[] = [];

	date: Date
	switcher: BudgetPeriodSwitcher
	urlPrefix = "budget"

	constructor(
		private expenseService: ExpenseService,
		private budgetService: BudgetService,
		private route: ActivatedRoute,
		private modalService: NgbModal) { }

	ngOnInit() {
		this.route.params.subscribe(params => this.update(params));
		this.getBudgets()
	}

	beforeLeave() {
		//The modal would not close correctly on changing the URL
		//due to the background not being contained in the 'app-root' tag
		this.modal.close()
	}

	showDetails(expense: CategoryExpenses, content: any) {
		if (expense.expenses.length > 0) {
			this.detail = expense
			this.modal = this.modalService.open(content, this.modalOptions);
		}  
	}

	private piePlotData(calc: CategoryExpensesCalculator) {
		let expenses = this.getExpensesSortedByExpensesWithoutTotal(calc)
		return expenses.map(e => e.amount.amount)
	}

	private piePlotLabels(calc: CategoryExpensesCalculator) {
		let expenses = this.getExpensesSortedByExpensesWithoutTotal(calc)
		return expenses.map(e => e.category.name)
	}

	private getExpensesSortedByExpensesWithoutTotal(calc: CategoryExpensesCalculator) {
		return calc.sortByExpenses().calculateExpenses();
	}

	private update(params: any) {
		let period = DateExtractor.getBudgetPeriod(params)
		this.switcher = new BudgetPeriodSwitcher(period)
		this.date = this.switcher.switch(new DateExtractor(), params)
		this.getBudgets()
	}

	private getBudgets() {
		this.budgetService.getBudgets()
			.subscribe(budgets => this.getExpenses(budgets.values))
	}

	private getExpenses(budgets: Budget[]) {
		let query = this.switcher.switch(new PeriodQuery(), this.date)
		let sort = { field: "date", direction: "desc" }
		this.expenseService.getExpenses(null, query, sort, null)
			.subscribe(expenses => this.init(expenses.values, budgets))
	}

	private init(expenses: Expense[], budgets: Budget[]) {
		let calc = new CategoryExpensesCalculator(expenses, budgets, this.switcher.getPeriod());
		this.expensesForTable = calc.sortByBudget().calculateExpenses();
		this.expensesForTable.push(calc.calculateTotalExpenses());
		this.pieChartData = this.piePlotData(calc);
		this.pieChartLabels = this.piePlotLabels(calc);
		this.lineCharts = this.expensesForTable
			.map(e => this.newLineChartData(e));
		}

	private newLineChartData(expenses: CategoryExpenses) {
		return new CategoryExpensesLineChartData(this.date, this.switcher, expenses);
	}
}

const LINE_CONFIG: ChartDataSets = {
	lineTension: 0, // No bezier curves, straight lines
	pointRadius: 0 // Don't show points, just lines
};

class CategoryExpensesLineChartData {

	category: string
	data: ChartDataSets[]
	labels: string[]

	constructor(private date: Date, private switcher: BudgetPeriodSwitcher, private expenses: CategoryExpenses) {
		this.category = expenses.category.name;
		this.data = this.getData();
		this.labels = this.getLabels();
	}

	private getData(): ChartDataSets[] {
		let days = this.numDays();
		let res = [];
		for (let i = 1; i <= days; i++) {
			res.push((this.expenses.budget.amount * i) / days);
		}
		return [
			Object.assign({ data: res , label: 'Budget'}, LINE_CONFIG),
			Object.assign({ data: this.getExpenseData(), label: 'Expenses'}, LINE_CONFIG)
		];
	}

	private getLabels(): string[] {
		let days = this.numDays();
		return range(1, days + 1).map((val) => "" + val);
	}

	private getExpenseData(): number[] {
		let days = this.numDays();
		let res = newFilledArray(days, 0);
		for (let expense of this.expenses.expenses) {
			let date = new Date(expense.date.timestamp);
			let offset = this.switcher.switch(new DaysSinceStart(), date);
			for (let i = offset; i <= days; i++) {
				res[i] = res[i] + expense.amount.amount;
			} 
		}
		return res;
	}

	private numDays() {
		return this.switcher.switch(new NumberOfDays(), this.date);
	}
}