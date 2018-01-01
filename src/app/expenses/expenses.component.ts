import { Component, OnInit, ViewChild } from '@angular/core';
import { SubList, Expense } from '../model';
import { ExpenseService } from '../expense.service';
import { MatTableDataSource, MatSort } from '@angular/material';

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
  pagination = {from: 0, count: 3}


  constructor(private expenseService: ExpenseService) { }

  ngOnInit() {
    this.sort.sortChange.subscribe(() => this.getExpenses())
    this.getExpenses()
  }

  setPagination(event: any) {
    let size = event.pageSize
    let page = event.pageIndex
    this.pagination = {from: size * page, count: size}
    this.getExpenses()
  }

  private getExpenses() {
    this.isLoadingResults = true
    let sort = null
    console.log(this.sort)
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
