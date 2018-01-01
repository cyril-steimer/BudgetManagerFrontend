import { Component, OnInit, ViewChild } from '@angular/core';
import { SubList, Expense } from '../model';
import { ExpenseService } from '../expense.service';
import { MatTableDataSource, MatSort, MatSortable } from '@angular/material';

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

  search(value: string) {
    console.log(value)
  }

  private getExpenses() {
    this.isLoadingResults = true
    let sort = null
    if (this.sort.active) {
      sort = {field: this.sort.active, direction: this.sort.direction}
    }
    this.expenseService.getAllExpenses(sort, this.pagination)
      .subscribe(res => this.setExpenses(res))
  }

  private setExpenses(res: SubList<Expense>) {
    this.isLoadingResults = false
    this.length = res.count
    this.expenses.data = res.values
  }
}
