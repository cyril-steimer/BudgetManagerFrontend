import {Component, OnInit} from '@angular/core';
import {BudgetService} from '../budget.service';
import {Budget, BudgetAmount} from '../model';
import {ModelUtil} from '../model.util';
import {Location} from '@angular/common';
import {BudgetPeriod} from '../budget.period';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'app-edit-budget',
    templateUrl: './edit-budget.component.html',
    styleUrls: ['./edit-budget.component.css']
})
export class EditBudgetComponent implements OnInit {

    budget: Budget;
    newBudget = true;

    periods = [BudgetPeriod.MONTHLY, BudgetPeriod.YEARLY];

    months = [];

    constructor(
        private budgetService: BudgetService,
        private location: Location,
        private route: ActivatedRoute) {

        for (let month = 0; month < 12; month++) {
            const date = new Date(2000, month);
            this.months[month] = date.getMonthName();
        }
    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id == null) {
            this.budget = ModelUtil.emptyBudget();
        } else {
            this.newBudget = false;
            this.budgetService.getBudgetById(id)
                .subscribe(budget => this.budget = budget);
        }
    }

    years(amount: BudgetAmount) {
        const now = new Date();
        const minYear = Math.min(now.getFullYear(), amount.from.year, amount.to.year);
        const years = [];
        for (let year = minYear; year < now.getFullYear() + 5; year++) {
            years.push(year);
        }
        return years;
    }

    back() {
        this.location.back();
    }

    submit() {
        this.doSubmit().subscribe(() => this.back());
    }

    delete() {
        this.budgetService.deleteBudget(this.budget)
            .subscribe(() => this.back());
    }

    removeBudget(index: number) {
        this.budget.amounts.splice(index, 1);
    }

    addBudget() {
        this.budget.amounts.push(ModelUtil.emptyBudgetAmount());
    }

    private doSubmit(): Observable<any> {
        if (this.newBudget) {
            return this.budgetService.addBudget(this.budget);
        }
        return this.budgetService.updateBudget(this.budget);
    }
}
