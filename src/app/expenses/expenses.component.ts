import { Component, OnInit } from '@angular/core';
import { SubList, Expense } from '../model';
import { ExpenseService } from '../expense.service';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {

  expenses: SubList<Expense>

  constructor(private expenseService: ExpenseService) { }

  ngOnInit() {
    this.expenseService.getAllExpenses()
      .subscribe(expenses => this.expenses = expenses)
  }
}
