import { Component, OnInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { Expense } from '../model';
import { ExpenseService } from '../expense.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ModelUtil } from '../model.util';
import { Observable } from 'rxjs/Observable';
import * as Materialize from 'materialize-css'
import * as $ from 'jquery'

@Component({
  selector: 'app-edit-expense',
  templateUrl: './edit-expense.component.html',
  styleUrls: ['./edit-expense.component.css']
})
export class EditExpenseComponent implements OnInit, AfterViewChecked {

  expense: Expense = null
  newExpense: boolean = true

  picker: any = null

  constructor(
    private expenseService: ExpenseService,
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
  }

  ngAfterViewChecked() {
    if (Materialize.updateTextFields) {
      Materialize.updateTextFields()
    }
    if (this.expense != null && this.picker == null) {
      let input = $(".datepicker").pickadate({
        onSet: ctx => this.onSetDatePicker(ctx),
        clear: null //Don't show the 'clear' button
      })
      this.picker = input.pickadate("picker")
      this.picker.set("select", this.expense.date.timestamp)
    }
  }

  back() {
    this.location.back()
  }

  submit() {
    this.doSubmit()
      .subscribe(() => this.back())
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
