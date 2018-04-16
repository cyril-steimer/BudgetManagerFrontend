import { Component, OnInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { Expense, Category } from '../model';
import { ExpenseService } from '../expense.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ModelUtil } from '../model.util';
import { Observable } from 'rxjs/Observable';
import * as Materialize from 'materialize-css'
import * as $ from 'jquery'
import { BudgetService } from '../budget.service';

@Component({
  selector: 'app-edit-expense',
  templateUrl: './edit-expense.component.html',
  styleUrls: ['./edit-expense.component.css']
})
export class EditExpenseComponent implements OnInit, AfterViewChecked {

  expense: Expense = null
  newExpense: boolean = true

  categories: Category[] = []

  initialized = false

  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private route: ActivatedRoute,
    private location: Location,
    private ref: ChangeDetectorRef) { }

  ngOnInit() {
    let id = this.route.snapshot.paramMap.get("id")
    if (id == null) {
      this.setExpense(ModelUtil.emptyExpense())
    } else {
      this.newExpense = false
      this.expenseService.getExpenseById(id)
        .subscribe(expense => this.setExpense(expense))
    }
    this.budgetService.getCategories()
      .subscribe(categories => this.setCategories(categories.values))
  }

  ngAfterViewChecked() {
    if (Materialize.updateTextFields) {
      Materialize.updateTextFields()
    }
    if (this.expense != null && this.categories.length > 0
      && !this.initialized) {
      let input = $(".datepicker").pickadate({
        onSet: ctx => this.onSetDatePicker(ctx),
        clear: null //Don't show the 'clear' button
      })
      let picker = input.pickadate("picker")
      picker.set("select", this.expense.date.timestamp)
      $("#category").material_select()
      this.initialized = true
    }
  }

  back() {
    this.location.back()
  }

  submit() {
    this.doSubmit()
      .subscribe(() => this.back())
  }

  private setCategories(categories: Category[]) {
    this.categories = categories
    $("#category").material_select()
  }

  private onSetDatePicker(select: any) {
    let time = +select.select
    if (!isNaN(time)) {
      this.expense.date.timestamp = time
    }
  }

  private doSubmit(): Observable<any> {
    if (this.newExpense) {
      return this.expenseService.addExpense(this.expense)
    }
    return this.expenseService.updateExpense(this.expense)
  }

  private setExpense(expense: Expense) {
    this.expense = expense
  }
}
