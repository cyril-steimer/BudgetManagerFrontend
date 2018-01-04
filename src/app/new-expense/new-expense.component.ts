import { Component, OnInit } from '@angular/core';
import { Expense } from '../model';
import { ExpenseService } from '../expense.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-new-expense',
  templateUrl: './new-expense.component.html',
  styleUrls: ['./new-expense.component.css']
})
export class NewExpenseComponent implements OnInit {

  name: string
  amount: number
  category: string
  date: Date = new Date()

  constructor(
    private expenseService: ExpenseService,
    private location: Location) { }

  ngOnInit() {
  }

  back() {
    this.location.back()
  }

  addExpense() {
    let expense: Expense = {
      id: 0,
      name: { name: this.name },
      amount: { amount: this.amount },
      category: { name: this.category },
      date: this.date
    }
    this.expenseService.addExpense(expense)
      .subscribe(() => this.location.back())
  }
}