import { Injectable } from '@angular/core';
import { Expense, SubList } from './model';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of'

@Injectable()
export class ExpenseService {

  expenses: SubList<Expense>

  constructor() {
    let e: Expense[] = [
      {
        id: 100,
        name: "Migros",
        amount: 300.0,
        category: "Food",
        date: new Date()
      }
    ]
    this.expenses = {
      count: e.length,
      values: e
    }
  }

  getAllExpenses(): Observable<SubList<Expense>> {
    return of(this.expenses)
  }
}
