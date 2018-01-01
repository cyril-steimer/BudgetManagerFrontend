import { Component, OnInit } from '@angular/core';
import { SubList, Expense } from '../model';
import { ExpenseService } from '../expense.service';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {

  displayedColumns = ["name", "amount", "category", "date"]
  expenses = new MatTableDataSource()

  constructor(private expenseService: ExpenseService) { }

  ngOnInit() {
    this.expenseService.getAllExpenses()
      .subscribe(expenses => this.expenses.data = expenses.values)
  }
}
