import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SubList, Budget, Category } from './model';

@Injectable()
export class BudgetService {

  private budgetUrl = "/api/v1/budget"

  private categoryUrl = "/api/v1/category"

  constructor(private http: HttpClient) { }

  getBudgets(): Observable<SubList<Budget>> {
    return this.http.get<SubList<Budget>>(this.budgetUrl)
  }

  getCategories(): Observable<SubList<Category>> {
    return this.http.get<SubList<Category>>(this.categoryUrl)
  }
}
