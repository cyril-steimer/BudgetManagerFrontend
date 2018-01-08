import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Expense, Budget, CategoryExpenses, Category } from '../model';
import { ExpenseService } from '../expense.service';
import { BudgetService } from '../budget.service';
import { QueryUtil } from '../query.util';
import { ModelUtil } from '../model.util';
import * as $ from 'jquery'

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css']
})
export class BudgetComponent implements OnInit {

  month: Date
  urlPrefix = "budget"

  expenses: CategoryExpenses[]
  budgets: Budget[]

  detail: CategoryExpenses

  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => this.setMonth(params));
    this.getBudgets()
    $(".modal").modal()
  }

  showDetails(expense: CategoryExpenses) {
    if (expense.expenses.length > 0) {
      this.detail = expense
      $("#detail-modal").modal("open")
    }  
  }

  private setMonth(params: any) {
    let year = params.year
    let month = params.month
    if (year && month) {
      this.month = new Date(+year, +month)
      this.getBudgets()
    }
  }

  private getBudgets() {
    this.budgetService.getBudgets()
      .subscribe(budgets => {
        this.budgets = budgets.values
        this.getExpenses()
      })
  }

  private getExpenses() {
    let query = QueryUtil.monthQuery(this.month)
    let sort = { field: "date", direction: "desc" }
    this.expenseService.getExpenses(null, query, sort, null)
      .subscribe(expenses => this.calculateCategoryExpenses(expenses.values))
  }

  private calculateCategoryExpenses(expenses: Expense[]) {
    this.expenses = this.budgets
      .map(b => this.calculateCategoryExpensesForBudget(expenses, b))
    this.expenses.push(this.calculateOtherExpenses(expenses))
    this.expenses.push(this.calculateTotal(expenses))
  }

  private calculateTotal(expenses: Expense[]) {
    return { 
      category: { name: "Total"}, 
      amount: ModelUtil.sumExpenses(expenses),
      budget: ModelUtil.sumBudgets(this.budgets),
      expenses: expenses
    }
  }

  private calculateOtherExpenses(expenses: Expense[]) {
    let other = expenses
      .filter(e => this.budgets.filter(b => b.category.name === e.category.name).length == 0)
    let sum = ModelUtil.sumExpenses(other)
    return { 
      category: { name: "Not Budgeted" }, 
      amount: sum, 
      budget: { amount: 0 }, 
      expenses: other 
    }
  }

  private calculateCategoryExpensesForBudget(expenses: Expense[], budget: Budget) {
    let relevant = ModelUtil.getExpensesWithCategory(expenses, budget.category)
    let sum = ModelUtil.sumExpenses(relevant)
    return { 
      category: budget.category, 
      amount: sum, 
      budget: budget.amount,
      expenses: relevant
    }
  }
}
