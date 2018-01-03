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

  private delayedSearch = new DelayedSearch(300, term => this.setSearchTerm(term))
  private searchTerm: string = ""

  private searchBody: {}

  constructor(
    private expenseService: ExpenseService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.getSearchBody()
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

  private getSearchBody() {
    let year = this.route.snapshot.paramMap.get("year")
    let month = this.route.snapshot.paramMap.get("month")
    if (year && month) {
      let start = new Date(+year, +month)
      let end = new Date(+year, +month + 1)
      //TODO This is ugly as hell....
      this.searchBody = {
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
      this.searchTerm, this.searchBody, sort, this.pagination)
  }

  private setExpenses(res: SubList<Expense>) {
    this.isLoadingResults = false
    this.length = res.count
    this.expenses.data = res.values
  }
}
