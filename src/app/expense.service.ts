import { Injectable } from '@angular/core';
import { Expense, SubList, Pagination, Sort, ActualExpense, ExpenseTemplate } from './model';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export abstract class AbstractExpenseService<T extends Expense> {

	constructor(private http: HttpClient, private url: string) { }

	getExpenses(
		filter?: string, 
		searchBody?: any, 
		sort?: Sort, 
		pagination?: Pagination): Observable<SubList<T>> {

		let url = this.getSearchUrl(filter, searchBody);
		let options = this.createOptions(sort, pagination);
		if (searchBody == null) {
			return this.http.get<SubList<T>>(url, options);
		}
		return this.http.post<SubList<T>>(url, searchBody, options);
	}

	getExpenseById(id: string): Observable<T> {
		let url = `${this.url}/field/id/${id}`;
		let options = {
			params: { "single": "true" }
		};
		return this.http.get<T>(url, options);
	}

	deleteExpense(expense: T): Observable<any> {
		let params = { "id": expense.id };
		return this.http.delete(this.url, { params: params });
	}

	addExpense(expense: T): Observable<any> {
		return this.http.post(this.url, expense);
	}

	updateExpense(expense: T): Observable<any> {
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
export class ExpenseService extends AbstractExpenseService<ActualExpense> {

	constructor(http: HttpClient) {
		super(http, '/api/v1/expenses');
	}
}

@Injectable()
export class TemplateService extends AbstractExpenseService<ExpenseTemplate> {

	constructor(http: HttpClient) {
		super(http, '/api/v1/templates');
	}
}

const TYPE_TEMPLATE = 'template';
export const DATA_TEMPLATE = {'type': TYPE_TEMPLATE};

export class ExpenseType<T extends Expense> {

	private constructor (private singular: string, private plural: string) { }

	public getAddUrl(): string {
		return `/add/${this.singular}`;
	}

	public getCloneUrl(template: Expense): string {
		if (this == ExpenseType.EXPENSE) {
			return `/add/expense/copy/${template.id}`;
		}
		return `/add/expense/template/${template.id}`;
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

	public canSaveAsTemplate(): boolean {
		return this == ExpenseType.EXPENSE;
	}

	public static TEMPLATE = new ExpenseType<ExpenseTemplate>('template', 'templates');

	public static EXPENSE = new ExpenseType<ActualExpense>('expense', 'expenses');

	public static forRoute(route: ActivatedRoute): ExpenseType<Expense> {
		let data = route.snapshot.data;
		if (data.type == TYPE_TEMPLATE) {
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

	getService<T extends Expense>(type: ExpenseType<T>): AbstractExpenseService<T> {
		if (type == ExpenseType.TEMPLATE) {
			return this.getTemplateService() as AbstractExpenseService<any>;
		} else if (type == ExpenseType.EXPENSE) {
			return this.getExpenseService() as AbstractExpenseService<any>;
		}
		throw new Error('Unknown expense type');
	}
}

@Injectable()
export class ExpenseResolverService implements Resolve<Expense> {

	constructor(private provider: ExpenseServiceProvider) { }

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Expense> {
		if (route.paramMap.has('templateid')) {
			return this.provider.getTemplateService().getExpenseById(route.paramMap.get('templateid'));
		}
		return this.provider.getExpenseService().getExpenseById(route.paramMap.get('id'));
	}
}