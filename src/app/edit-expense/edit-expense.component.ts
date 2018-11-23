import { Component, OnInit, ChangeDetectorRef, AfterViewChecked, Injectable } from '@angular/core';
import { Expense, Category, PaymentMethod } from '../model';
import { ExpenseService } from '../expense.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ModelUtil } from '../model.util';
import { Observable } from 'rxjs/Observable';
import { BudgetService } from '../budget.service';
import { NgbDateStruct, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Injectable()
export class NgbDateTimestampAdapter extends NgbDateAdapter<number> {

	fromModel(value: number): NgbDateStruct {
		if (value) {
			let date = new Date(value);
			return {
				year: date.getFullYear(),
				month: date.getMonth() + 1,
				day: date.getDate()
			};
		}
		return null;
	}
	
	toModel(date: NgbDateStruct): number {
		if (date) {
			let res = new Date(date.year, date.month - 1, date.day);
			return res.getTime();
		}
		return null;
	}
}

@Component({
	selector: 'app-edit-expense',
	templateUrl: './edit-expense.component.html',
	styleUrls: ['./edit-expense.component.css'],
	providers: [{provide: NgbDateAdapter, useClass: NgbDateTimestampAdapter}]
})
export class EditExpenseComponent implements OnInit {

	expense: Expense = null
	newExpense: boolean = true

	categories: Category[] = []

	initialized = false

	paymentMethods: string[] = []
	methodTypeahead = (text$: Observable<string>) =>
		text$
			.debounceTime(200)
			.distinctUntilChanged()
			.map(term => this.paymentMethods.filter(v => v.indexOf(term) > -1));

			
	tags: string[] = [];
	tagTypeahead = (text$: Observable<string>) =>
		text$
			.debounceTime(200)
			.distinctUntilChanged()
			.map(term => this.tags.filter(v => v.indexOf(term) > -1));

	constructor(
		private expenseService: ExpenseService,
		private budgetService: BudgetService,
		private route: ActivatedRoute,
		private location: Location) { }

	ngOnInit() {
		let id = this.route.snapshot.paramMap.get("id")
		if (id == null) {
			this.expense = ModelUtil.emptyExpense();
			this.expense.date.timestamp = new Date().getTime();
		} else {
			this.newExpense = false
			this.expenseService.getExpenseById(id)
				.subscribe(expense => this.expense = expense);
		}
		this.budgetService.getCategories()
			.subscribe(categories => this.categories = categories.values);
		this.expenseService.getPaymentMethods()
			.subscribe(methods => this.paymentMethods = methods.map(m => m.name));
		this.expenseService.getTags()
			.subscribe(tags => this.tags = tags.map(t => t.name));
	}

	back() {
		this.location.back();
	}

	submit() {
		this.doSubmit().subscribe(() => this.back());
	}

	delete() {
		this.expenseService.deleteExpense(this.expense)
			.subscribe(() => this.back());
	}

	removeTag(tag: string) {
		this.expense.tags = this.expense.tags.filter(t => t.name != tag);
	}

	addTag(event: KeyboardEvent, tag: string) {
		//Ensures that if the auto-complete window is open, enter
		//is not wrongly interpreted to add a tag.
		if ((<Element>event.currentTarget).className.indexOf("open") > -1) {
			return;
		}
		if (tag.length > 0 
			&& this.expense.tags.findIndex(t => t.name == tag) == -1) {
			this.expense.tags.push({"name": tag});
		}
	}

	private doSubmit(): Observable<any> {
		if (this.newExpense) {
			return this.expenseService.addExpense(this.expense)
		}
		return this.expenseService.updateExpense(this.expense)
	}
}
