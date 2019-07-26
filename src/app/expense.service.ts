import { Injectable } from '@angular/core';
import { Expense, SubList, Pagination, Sort, PaymentMethod, Tag, Author } from './model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const EXPENSE_URL = "/api/v1/expenses";
const METHOD_URL = "/api/v1/paymentmethod";
const TAG_URL = "/api/v1/tag";
const AUTHOR_URL = "/api/v1/author";

@Injectable()
export class ExpenseService {

	//TODO: Handling of errors!

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
		let url = `${EXPENSE_URL}/field/id/${id}`;
		let options = {
			params: { "single": "true" }
		};
		return this.http.get<Expense>(url, options);
	}

	deleteExpense(expense: Expense): Observable<any> {
		let params = { "id": expense.id };
		return this.http.delete(EXPENSE_URL, { params: params });
	}

	addExpense(expense: Expense): Observable<any> {
		return this.http.post(EXPENSE_URL, expense);
	}

	updateExpense(expense: Expense): Observable<any> {
		return this.http.put(EXPENSE_URL, expense);
	}

	getPaymentMethods(): Observable<PaymentMethod[]> {
		return this.http.get<PaymentMethod[]>(METHOD_URL);
	}

	getTags(): Observable<Tag[]> {
		return this.http.get<Tag[]>(TAG_URL);
	}

	getAuthors(): Observable<Author[]> {
		return this.http.get<Author[]>(AUTHOR_URL);
	}

	private getSearchUrl(filter?: string, body?: any) {
		if (filter) {
			return `${EXPENSE_URL}/search/${filter}`;
		} else if (body) {
			return `${EXPENSE_URL}/search`;
		}
		return EXPENSE_URL;
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
