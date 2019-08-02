import { Injectable } from '@angular/core';
import { Expense, SubList, Pagination, Sort } from './model';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

export abstract class AbstractExpenseService {

	constructor(private http: HttpClient, private url: string) { }

	getExpenses(
		filter?: string, 
		searchBody?: any, 
		sort?: Sort, 
		pagination?: Pagination): Observable<SubList<Expense>> {

		let url = this.getSearchUrl(filter, searchBody);
		let options = this.createOptions(sort, pagination);
		if (searchBody == null) {
			return this.http.get<SubList<Expense>>(url, options);
		}
		return this.http.post<SubList<Expense>>(url, searchBody, options);
	}

	getExpenseById(id: string): Observable<Expense> {
		let url = `${this.url}/field/id/${id}`;
		let options = {
			params: { "single": "true" }
		};
		return this.http.get<Expense>(url, options);
	}

	deleteExpense(expense: Expense): Observable<any> {
		let params = { "id": expense.id };
		return this.http.delete(this.url, { params: params });
	}

	addExpense(expense: Expense): Observable<any> {
		return this.http.post(this.url, expense);
	}

	updateExpense(expense: Expense): Observable<any> {
		return this.http.put(this.url, expense);
	}

	private getSearchUrl(filter?: string, body?: any) {
		if (filter) {
			return `${this.url}/search/${filter}`;
		} else if (body) {
			return `${this.url}/search`;
		}
		return this.url;
	}

	private createOptions(sort?: Sort, pagination?: Pagination): { params: { [param: string]: string;} } {
		let params = {};
		this.addSortParams(params, sort);
		this.addPaginationParams(params, pagination);
		return {
			params: params
		};
	}

	private addSortParams(params: {}, sort?: Sort) {
		if (sort != null) {
			params["sort"] = sort.field;
			params["dir"] = sort.direction;
		}
	}

	private addPaginationParams(params: {}, pagination?: Pagination) {
		if (pagination != null) {
			params["from"] = pagination.from;
			params["count"] = pagination.count;
		}
	}
}

@Injectable()
export class ExpenseService extends AbstractExpenseService {

	constructor(http: HttpClient) {
		super(http, '/api/v1/expenses');
	}
}

@Injectable()
export class TemplateService extends AbstractExpenseService {

	constructor(http: HttpClient) {
		super(http, '/api/v1/templates');
	}
}

export class ExpenseType {

	private constructor (private singular: string, private plural: string) { }

	public getAddUrl(): string {
		return `/${this.singular}/add`;
	}

	public getEditUrl(expense: Expense): string {
		return `/edit/${this.singular}/${expense.id}`;
	}

	public getViewAllUrl(): string {
		return `/${this.plural}`;
	}

	public getFilterByFieldUrl(field: string, value: string): string {
		return `/${this.plural}/field/${field}/${value}`;
	}

	public isDateFieldRelevant(): boolean {
		return this == ExpenseType.EXPENSE;
	}

	public isSumRelevant(): boolean {
		return this == ExpenseType.EXPENSE;
	}

	public static TEMPLATE = new ExpenseType('template', 'templates');

	public static EXPENSE = new ExpenseType('expense', 'expenses');

	public static forUrl(route: ActivatedRoute): ExpenseType {
		if (route.snapshot.toString().indexOf('template') >= 0) {
			return ExpenseType.TEMPLATE;
		}
		return ExpenseType.EXPENSE;
	}
}

@Injectable()
export class ExpenseServiceProvider {

	//TODO: Handling of errors!

	constructor(private http: HttpClient) { }

	getExpenseService(): ExpenseService {
		return new ExpenseService(this.http);
	}

	getTemplateService(): TemplateService {
		return new TemplateService(this.http);
	}

	getService(type: ExpenseType): AbstractExpenseService {
		if (type == ExpenseType.TEMPLATE) {
			return this.getTemplateService();
		} else if (type == ExpenseType.EXPENSE) {
			return this.getExpenseService();
		}
		throw new Error('Unknown expense type');
	}
}
