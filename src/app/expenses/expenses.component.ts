import { Component, OnInit, ViewChild } from '@angular/core';
import { SubList, Expense, Sort } from '../model';
import { ExpenseService } from '../expense.service';
import { MatTableDataSource, MatSort, MatSortable } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { DelayedSearch } from '../delayed.search';
import { ActivatedRoute } from '@angular/router';
import { QueryUtil } from '../query.util';
import { ExpenseSorter, SortDirection, SortField } from '../expenses-table/expenses-table.component';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit, ExpenseSorter {

  isLoadingResults = false

  expenses: Expense[] = []

  urlPrefix = "expenses"
  month: Date

  sorter = this

  private delayedSearch = new DelayedSearch(300, term => this.setSearchTerm(term))
  private searchTerm: string = ""

  private activeSort: Sort = { field: "date", direction: "desc" }

  constructor(
    private expenseService: ExpenseService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => this.setMonth(params));
    this.getExpenses()
  }

  sort(field: SortField, dir: SortDirection) {
    this.activeSort = { field: field.field, direction: dir.dir }
    this.getExpenses()
  }

  removeSort() {
    this.activeSort = null
    this.getExpenses()
  }

  search(term: string) {
    this.delayedSearch.set(term)
  }

  private setMonth(params: any) {
    let year = params.year
    let month = params.month
    if (year && month) {
      this.month = new Date(+year, +month)
      this.getExpenses()
    }
  }

  private getSearchBody() {
    if (this.month) {
      return QueryUtil.monthQuery(this.month)
    }
    return null
  }

  private setSearchTerm(term: string) {
    this.searchTerm = term
    this.getExpenses()
  }

  private getExpenses() {
    this.isLoadingResults = true
    let observable = this.getExpensesObservable()
    observable.subscribe(expenses => this.setExpenses(expenses))
  }

  private getExpensesObservable(): Observable<SubList<Expense>> {
    return this.expenseService.getExpenses(
      this.searchTerm, this.getSearchBody(), this.activeSort, null)
  }

  private setExpenses(res: SubList<Expense>) {
    this.isLoadingResults = false
    this.expenses = res.values
  }
}
