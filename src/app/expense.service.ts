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
    let options = this.createOptions(sort, pagination)
    return this.http.get<SubList<Expense>>(this.expenseUrl, options)
  }

  searchExpenses(search: string, sort?: Sort, pagination?: Pagination): Observable<SubList<Expense>> {
    let url = `${this.expenseUrl}/search/${search}`
    let options = this.createOptions(sort, pagination)
    return this.http.get<SubList<Expense>>(url, options)
  }

  private createOptions(sort?: Sort, pagination?: Pagination): { params: { [param: string]: string;} } {
    let params = {}
    this.addSortParams(params, sort)
    this.addPaginationParams(params, pagination)
    return {
      params: params
    }
  }

  private addSortParams(params: {}, sort?: Sort) {
    if (sort != null) {
      params["sort"] = sort.field
      params["dir"] = sort.direction
    }
  }

  private addPaginationParams(params: {}, pagination?: Pagination) {
    if (pagination != null) {
      params["from"] = pagination.from
      params["count"] = pagination.count
    }
  }
}
