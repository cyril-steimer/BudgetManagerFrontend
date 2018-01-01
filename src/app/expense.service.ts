import { Injectable } from '@angular/core';
import { Expense, SubList, Pagination, Sort } from './model';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of'
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ExpenseService {

  private expenseUrl = "/api/v1/expenses"

  constructor(private http: HttpClient) { }

  getAllExpenses(sort?: Sort, pagination?: Pagination): Observable<SubList<Expense>> {
    let params = {}
    if (sort != null) {
      params["sort"] = sort.field
      params["dir"] = sort.direction
    }
    if (pagination != null) {
      params["from"] = pagination.from
      params["count"] = pagination.count
    }
    let options = {
      params: params
    }
    return this.http.get<SubList<Expense>>(this.expenseUrl, options)
  }
}
