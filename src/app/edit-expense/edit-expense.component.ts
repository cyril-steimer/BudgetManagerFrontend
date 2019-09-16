import { Component, OnInit, Injectable } from '@angular/core';
import { Expense, Category, ActualExpense, Timestamp } from '../model';
import { ExpenseServiceProvider, AbstractExpenseService, ExpenseType } from '../expense.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ModelUtil, TimestampUtil } from '../model.util';
import { Observable } from 'rxjs/Observable';
import { BudgetService } from '../budget.service';
import { NgbDateStruct, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { AutocompleteService } from '../autocomplete.service';
import { of } from 'rxjs/observable/of';

@Injectable()
export class NgbDateTimestampAdapter extends NgbDateAdapter<Timestamp> {

	fromModel(value: Timestamp): NgbDateStruct {
		return value;
	}
	
	toModel(date: NgbDateStruct): Timestamp {
		return date;
	}
}

@Component({
	selector: 'app-edit-expense',
	templateUrl: './edit-expense.component.html',
	styleUrls: ['./edit-expense.component.css'],
	providers: [{provide: NgbDateAdapter, useClass: NgbDateTimestampAdapter}]
})
export class EditExpenseComponent implements OnInit {

	expense: ActualExpense = null
	newExpense: boolean = true

	categories: Category[] = []

	initialized = false

	private paymentMethods: string[] = []
	methodTypeahead = (text$: Observable<string>) =>
		text$
			.debounceTime(200)
			.distinctUntilChanged()
			.map(term => this.paymentMethods.filter(v => v.indexOf(term) > -1));

			
	private tags: string[] = [];
	tagTypeahead = (text$: Observable<string>) =>
		text$
			.debounceTime(200)
			.distinctUntilChanged()
			.map(term => this.tags.filter(v => v.indexOf(term) > -1));

	private authors: string[] = [];
	authorTypeahead = (text$: Observable<string>) =>
		text$
			.debounceTime(200)
			.distinctUntilChanged()
			.map(term => this.authors.filter(v => v.indexOf(term) > -1));

	private expenseService: AbstractExpenseService<Expense>;
	expenseType: ExpenseType<Expense>;
	saveAsTemplate: boolean = false;

	constructor(
		private expenseServiceProvider: ExpenseServiceProvider,
		private autocompleteService: AutocompleteService,
		private budgetService: BudgetService,
		private route: ActivatedRoute,
		private location: Location) { }

	ngOnInit() {
		this.expenseType = ExpenseType.forRoute(this.route);
		this.expenseService = this.expenseServiceProvider.getService(this.expenseType);
		this.route.data.subscribe((data: {expense: ActualExpense, template: Expense}) => {
			this.newExpense = data.expense == null;
			this.expense = ModelUtil.toActualExpense(data.expense);
			if (this.expense == null) {
				this.expense = data.template == null ? ModelUtil.emptyExpense() : ModelUtil.toActualExpense(data.template);
				this.expense.date = TimestampUtil.fromDate(new Date());
			}
		});
		this.budgetService.getCategories()
			.subscribe(categories => this.categories = categories.values);
		this.autocompleteService.getPaymentMethods()
			.subscribe(methods => this.paymentMethods = methods.map(m => m.name));
		this.autocompleteService.getTags()
			.subscribe(tags => this.tags = tags.map(t => t.name));
		this.autocompleteService.getAuthors()
			.subscribe(authors => this.authors = authors.map(t => t.name));
	}

	back() {
		this.location.back();
	}

	submit() {
		this.doSubmit().then(() => this.back());
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

	private async doSubmit(): Promise<any> {
		let saveAsTemplate: Observable<any> = of();
		if (this.saveAsTemplate) {
			saveAsTemplate = this.expenseServiceProvider.getTemplateService().addExpense(this.expense);
		}
		await saveAsTemplate.toPromise();
		if (this.newExpense) {
			return this.expenseService.addExpense(this.expense).toPromise();
		}
		return this.expenseService.updateExpense(this.expense).toPromise();
	}
}
