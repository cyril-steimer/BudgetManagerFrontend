import { Injectable } from '@angular/core';
import { Expense, SubList, Pagination, Sort } from './model';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of'
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ExpenseService {

  //TODO: Handling of errors!

  private expenseUrl = "/api/v1/expenses"

  constructor(private http: HttpClient) { }

  getExpenses(filter?: string, searchBody?: any, sort?: Sort, pagination?: Pagination): Observable<SubList<Expense>> {
    this.changeDateToJSON()
    let url = this.getSearchUrl(filter, searchBody)
    let options = this.createOptions(sort, pagination)
    if (searchBody == null) {
      return this.http.get<SubList<Expense>>(url, options)
    }
    return this.http.post<SubList<Expense>>(url, searchBody, options)
  }

  addExpense(expense: Expense): Observable<any> {
    this.changeDateToJSON()
    return this.http.post(this.expenseUrl, expense)
  }

  private getSearchUrl(filter?: string, body?: any) {
    if (filter) {
      return `${this.expenseUrl}/search/${filter}`
    } else if (body) {
      return `${this.expenseUrl}/search`
    }
    return this.expenseUrl
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

  //TODO Move this to a better place.
  //TODO Can we not override the global 'toJSON' method?
  private changeDateToJSON() {
    //https://stackoverflow.com/questions/11382606/javascript-date-tojson-dont-get-the-timezone-offset
    Date.prototype.toJSON = function(this: Date) {
      function addZ(n) {
        return (n<10? '0' : '') + n;
      }
      return this.getFullYear() + '-' + 
            addZ(this.getMonth() + 1) + '-' + 
            addZ(this.getDate());
    }
  }
}
