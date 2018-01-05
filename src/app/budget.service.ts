import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SubList, Budget } from './model';

@Injectable()
export class BudgetService {

  private budgetUrl = "/api/v1/budget"

  constructor(private http: HttpClient) { }

  getBudgets(): Observable<SubList<Budget>> {
    return this.http.get<SubList<Budget>>(this.budgetUrl)
  }
}
