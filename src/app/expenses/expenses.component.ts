import { Component, OnInit, ViewChild } from '@angular/core';
import { SubList, Expense, Sort } from '../model';
import { ExpenseService } from '../expense.service';
import { MatTableDataSource, MatSort, MatSortable } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { DelayedSearch } from '../delayed.search';
import { ActivatedRoute } from '@angular/router';
import { ExpenseSorter, SortDirection, SortField } from '../expenses-table/expenses-table.component';
import { BudgetPeriodSwitcher, BudgetPeriod, DateExtractor } from '../budget.period';
import { PeriodQuery } from '../query.util';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit, ExpenseSorter {

  isLoadingResults = false

  expenses: Expense[] = []

  date: Date
  switcher: BudgetPeriodSwitcher
  urlPrefix = "expenses"

  sorter = this

  private delayedSearch = new DelayedSearch(300, term => this.setSearchTerm(term))
  private searchTerm: string = ""

  private activeSort: Sort = { field: "date", direction: "desc" }

  constructor(
    private expenseService: ExpenseService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => this.update(params));
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

  private update(params: any) {
    let period = DateExtractor.getBudgetPeriod(params)
    if (period) {
      this.switcher = new BudgetPeriodSwitcher(period)
      this.date = this.switcher.switch(new DateExtractor(), params)
    } else {
      this.switcher = null
      this.date = null
    }      
    this.getExpenses()
  }

  private getSearchBody() {
    if (this.date) {
      return this.switcher.switch(new PeriodQuery(), this.date)
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
