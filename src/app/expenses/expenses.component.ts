import { Component, OnInit, ViewChild } from '@angular/core';
import { SubList, Expense } from '../model';
import { ExpenseService } from '../expense.service';
import { MatTableDataSource, MatSort, MatSortable } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { DelayedSearch } from '../delayed.search';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {

  isLoadingResults = false

  displayedColumns = ["name", "amount", "category", "date"]
  expenses = new MatTableDataSource()
  @ViewChild(MatSort) sort = new MatSort()
  
  length = 0
  pagination = {from: 0, count: 20}

  month: Date

  private delayedSearch = new DelayedSearch(300, term => this.setSearchTerm(term))
  private searchTerm: string = ""

  constructor(
    private expenseService: ExpenseService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.getMonth()
    let sortable: MatSortable = { id: "date", start: "desc", disableClear: null }
    this.sort.sort(sortable)
    this.getExpenses()
    this.sort.sortChange.subscribe(() => this.getExpenses())
  }

  setPagination(event: any) {
    let size = event.pageSize
    let page = event.pageIndex
    this.pagination = {from: size * page, count: size}
    this.getExpenses()
  }

  search(term: string) {
    this.delayedSearch.set(term)
  }
  private getMonth() {
    let year = this.route.snapshot.paramMap.get("year")
    let month = this.route.snapshot.paramMap.get("month")
    if (year && month) {
      this.month = new Date(+year, +month)
    }
  }

  private getSearchBody() {
    if (this.month) {
      let start = this.month
      let end = new Date(start.getFullYear(), start.getMonth() + 1)
      //TODO Ugly shit.
      return {
        and: [
          {
            date: {
              date: start,
              comparison: ">="
            }
          },
          {
            date: {
              date: end,
              comparison: "<"
            }
          }
        ]
      }
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
    let sort = null
    if (this.sort.active) {
      sort = {field: this.sort.active, direction: this.sort.direction}
    }
    return this.expenseService.getExpenses(
      this.searchTerm, this.getSearchBody(), sort, this.pagination)
  }

  private setExpenses(res: SubList<Expense>) {
    this.isLoadingResults = false
    this.length = res.count
    this.expenses.data = res.values
  }
}
