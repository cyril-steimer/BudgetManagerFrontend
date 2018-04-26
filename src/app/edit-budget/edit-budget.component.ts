import { Component, OnInit } from '@angular/core';
import { BudgetService } from '../budget.service';
import { Budget } from '../model';
import { ModelUtil } from '../model.util';
import { Location } from '@angular/common';
import { BudgetPeriod } from '../budget.period';

@Component({
	selector: 'app-edit-budget',
	templateUrl: './edit-budget.component.html',
	styleUrls: ['./edit-budget.component.css']
})
export class EditBudgetComponent implements OnInit {

	budget: Budget = ModelUtil.emptyBudget();

	periods = [BudgetPeriod.MONTHLY, BudgetPeriod.YEARLY];

	constructor(
		private budgetService: BudgetService,
		private location: Location) { }

	ngOnInit() {
	}

	back() {
		this.location.back();
	}

	submit() {
		this.budgetService.addBudget(this.budget)
			.subscribe(a => this.back());
	}

}
