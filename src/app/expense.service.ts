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

  getAllExpenses(sort?: Sort, pagination?: Pagination): Observable<SubList<Expense>> {
    let options = this.createOptions(sort, pagination)
    return this.http.get<SubList<Expense>>(this.expenseUrl, options)
  }

  searchExpenses(search: string, sort?: Sort, pagination?: Pagination): Observable<SubList<Expense>> {
    let url = `${this.expenseUrl}/search/${search}`
    let options = this.createOptions(sort, pagination)
    return this.http.get<SubList<Expense>>(url, options)
  }

  searchExpensesComplex(search: any, sort?: Sort, pagination?: Pagination): Observable<SubList<Expense>> {
    this.changeDateToJSON()
    let url = `${this.expenseUrl}/search`
    let options = this.createOptions(sort, pagination)
    return this.http.post<SubList<Expense>>(url, search, options)
  }

  addExpense(expense: Expense): Observable<any> {
    this.changeDateToJSON()
    return this.http.post(this.expenseUrl, expense)
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
