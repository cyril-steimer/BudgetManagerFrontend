import { Component, OnInit } from '@angular/core';
import { BudgetService } from '../budget.service';
import { Budget, BudgetAmount } from '../model';
import { ModelUtil } from '../model.util';
import { Location } from '@angular/common';
import { BudgetPeriod } from '../budget.period';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-edit-budget',
	templateUrl: './edit-budget.component.html',
	styleUrls: ['./edit-budget.component.css']
})
export class EditBudgetComponent implements OnInit {

	budget: Budget;
	newBudget: boolean = true

	periods = [BudgetPeriod.MONTHLY, BudgetPeriod.YEARLY];

	months = [];

	constructor(
		private budgetService: BudgetService,
		private location: Location,
		private route: ActivatedRoute) {

		for (let month = 0; month < 12; month++) {
			let date = new Date(2000, month);
			this.months[month] = date.getMonthName();
		}
	}

	ngOnInit() {
		let id = this.route.snapshot.paramMap.get('id')
		if (id == null) {
			this.budget = ModelUtil.emptyBudget();
		} else {
			this.newBudget = false;
			// TODO Add new method in DAO.
			this.budgetService.getBudgets()
				.subscribe(budgets => this.budget = this.findBudgetWithId(budgets.values, id));
		}
	}

	years(amount: BudgetAmount) {
		let now = new Date();
		let minYear = Math.min(now.getFullYear(), amount.from.year, amount.to.year);
		let years = [];
		for (let year = minYear; year < now.getFullYear() + 5; year++) {
			years.push(year);
		}
		return years;
	}

	back() {
		// TODO This currently adds an invalid budget! Why?
		this.location.back();
	}

	submit() {
		this.budgetService.addBudget(this.budget)
			.subscribe(a => this.back());
	}

	private findBudgetWithId(budgets: Budget[], id: string) {
		let filtered = budgets.filter(b => b.category.name == id);
		return filtered.length == 1 ? filtered[0] : null;
	}

}
