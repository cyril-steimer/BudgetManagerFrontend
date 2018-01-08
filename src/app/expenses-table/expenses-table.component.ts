import { Component, OnInit, Input } from '@angular/core';
import { Expense } from '../model';

@Component({
  selector: 'app-expenses-table',
  templateUrl: './expenses-table.component.html',
  styleUrls: ['./expenses-table.component.css']
})
export class ExpensesTableComponent implements OnInit {

  @Input() expenses: Expense[] = []

  constructor() { }

  ngOnInit() {
  }

  edit(expense: Expense) {
    //TODO
  }
}
