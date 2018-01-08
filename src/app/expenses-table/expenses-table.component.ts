import { Component, OnInit, Input } from '@angular/core';
import { Expense } from '../model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expenses-table',
  templateUrl: './expenses-table.component.html',
  styleUrls: ['./expenses-table.component.css']
})
export class ExpensesTableComponent implements OnInit {

  @Input() expenses: Expense[] = []
  @Input() beforeEdit: BeforeEdit

  constructor(private router: Router) { }

  ngOnInit() {
    console.log(this.expenses)
  }

  edit(expense: Expense) {
    if (this.beforeEdit) {
      this.beforeEdit.beforeEdit(expense)
    }
    this.router.navigate(["edit", "expense", expense.id])
  }
}

export interface BeforeEdit {
  beforeEdit(expense: Expense)
}