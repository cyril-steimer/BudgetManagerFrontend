import { Component, OnInit, ViewChild } from '@angular/core';
import { SubList, Expense } from '../model';
import { ExpenseService } from '../expense.service';
import { MatTableDataSource, MatSort, MatSortable } from '@angular/material';
import { Observable } from 'rxjs/Observable';

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

  private searchTerm = ""

  constructor(private expenseService: ExpenseService) { }

  ngOnInit() {
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

  search(event: any, term: string) {
    if (event.key == "Enter") {
      this.searchTerm = term
      this.getExpenses()
    }
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
    if (this.searchTerm) {
      return this.expenseService.searchExpenses(this.searchTerm, sort, this.pagination)
    }
    return this.expenseService.getAllExpenses(sort, this.pagination)
  }

  private setExpenses(res: SubList<Expense>) {
    this.isLoadingResults = false
    this.length = res.count
    this.expenses.data = res.values
  }
}
