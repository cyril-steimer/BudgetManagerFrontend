import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Expense, Budget, CategoryExpenses, Category } from '../model';
import { ExpenseService } from '../expense.service';
import { BudgetService } from '../budget.service';
import { PeriodQuery } from '../query.util';
import { ModelUtil, CategoryExpensesCalculator } from '../model.util';
import * as $ from 'jquery'
import { BeforeEdit } from '../expenses-table/expenses-table.component';
import { BudgetPeriod, BudgetPeriodSwitch, BudgetPeriodSwitcher, DateExtractor } from '../budget.period';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css']
})
export class BudgetComponent implements OnInit, BeforeEdit {


  expensesForTable: CategoryExpenses[]

  detail: CategoryExpenses

  callback = this

  pieChartData: number[]
  pieChartLabels: string[]
  pieChartType = "pie"

  date: Date
  switcher: BudgetPeriodSwitcher
  urlPrefix = "budget"

  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => this.update(params));
    this.getBudgets()
    $(".modal").modal()
    $("ul.tabs").tabs()
  }

  beforeEdit(expense: Expense) {
    //The modal would not close correctly on changing the URL
    //due to the background not being contained in the 'app-root' tag
    $("#detail-modal").modal("close")
  }

  showDetails(expense: CategoryExpenses) {
    if (expense.expenses.length > 0) {
      this.detail = expense
      $("#detail-modal").modal("open")
    }  
  }

  private plotData(calc: CategoryExpensesCalculator) {
    let expenses = this.getExpensesSortedByExpensesWithoutTotal(calc)
    return expenses.map(e => e.amount.amount)
  }

  private plotLabels(calc: CategoryExpensesCalculator) {
    let expenses = this.getExpensesSortedByExpensesWithoutTotal(calc)
    return expenses.map(e => e.category.name)
  }

  private getExpensesSortedByExpensesWithoutTotal(calc: CategoryExpensesCalculator) {
    let calculator = calc.sortByExpenses()
    let res = calculator.calculateBudgetedExpenses()
    res.push(calculator.calculateNotBudgetedExpenses())
    return res
  }

  private update(params: any) {
    let period = DateExtractor.getBudgetPeriod(params)
    this.switcher = new BudgetPeriodSwitcher(period)
    this.date = this.switcher.switch(new DateExtractor(), params)
    this.getBudgets()
  }

  private getBudgets() {
    this.budgetService.getBudgets()
      .subscribe(budgets => this.getExpenses(budgets.values))
  }

  private getExpenses(budgets: Budget[]) {
    let query = this.switcher.switch(new PeriodQuery(), this.date)
    let sort = { field: "date", direction: "desc" }
    this.expenseService.getExpenses(null, query, sort, null)
      .subscribe(expenses => this.init(expenses.values, budgets))
  }

  private init(expenses: Expense[], budgets: Budget[]) {
    let calc = new CategoryExpensesCalculator(expenses, budgets, this.switcher.getPeriod())
    this.expensesForTable = calc.sortByBudget().calculateAllExpenses()
    this.pieChartData = this.plotData(calc)
    this.pieChartLabels = this.plotLabels(calc)
  }
}