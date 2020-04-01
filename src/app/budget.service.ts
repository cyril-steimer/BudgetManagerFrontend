import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Budget, BudgetInPeriod, MonthYearPeriod, SubList} from './model';

@Injectable()
export class BudgetService {

	private budgetUrl = "/api/v1/budget"

	private categoryUrl = "/api/v1/category"

	constructor(private http: HttpClient) { }

	getBudgets(): Observable<SubList<Budget>> {
		return this.http.get<SubList<Budget>>(this.budgetUrl)
	}

	getBudgetByCategory(category: string): Observable<Budget> {
		let url = `${this.budgetUrl}/category/${category}`;
		return this.http.get<Budget>(url);
	}

	getBudgetById(id: string): Observable<Budget> {
		let url = `${this.budgetUrl}/id/${id}`;
		return this.http.get<Budget>(url);
	}

	getBudgetsInPeriod(period: MonthYearPeriod): Observable<SubList<BudgetInPeriod>> {
		return this.http.post<SubList<BudgetInPeriod>>(this.budgetUrl + '/period', period)
	}

	addBudget(budget: Budget): Observable<any> {
		return this.http.post(this.budgetUrl, budget)
	}

	updateBudget(budget: Budget): Observable<any> {
		return this.http.put(this.budgetUrl, budget);
	}

	deleteBudget(budget: Budget): Observable<any> {
		let params = { "id": budget.id };
		return this.http.delete(this.budgetUrl, { params: params });
	}
}
