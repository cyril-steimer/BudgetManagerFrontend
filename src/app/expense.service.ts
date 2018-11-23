import { Injectable } from '@angular/core';
import { Expense, SubList, Pagination, Sort, PaymentMethod, Tag } from './model';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of'
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ExpenseService {

	//TODO: Handling of errors!

	private expenseUrl = "/api/v1/expenses";
	private methodUrl = "/api/v1/paymentmethod";
	private tagUrl = "/api/v1/tag";

	constructor(private http: HttpClient) { }

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
		let url = `${this.expenseUrl}/field/id/${id}`;
		let options = {
			params: { "single": "true" }
		};
		return this.http.get<Expense>(url, options);
	}

	deleteExpense(expense: Expense): Observable<any> {
		let params = { "id": expense.id };
		return this.http.delete(this.expenseUrl, { params: params });
	}

	addExpense(expense: Expense): Observable<any> {
		return this.http.post(this.expenseUrl, expense);
	}

	updateExpense(expense: Expense): Observable<any> {
		return this.http.put(this.expenseUrl, expense);
	}

	getPaymentMethods(): Observable<PaymentMethod[]> {
		return this.http.get<PaymentMethod[]>(this.methodUrl);
	}

	getTags(): Observable<Tag[]> {
		return this.http.get<Tag[]>(this.tagUrl);
	}

	private getSearchUrl(filter?: string, body?: any) {
		if (filter) {
			return `${this.expenseUrl}/search/${filter}`;
		} else if (body) {
			return `${this.expenseUrl}/search`;
		}
		return this.expenseUrl;
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
