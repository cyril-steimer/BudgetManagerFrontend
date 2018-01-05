import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Expense, Budget, CategoryExpenses, Category } from '../model';
import { ExpenseService } from '../expense.service';
import { BudgetService } from '../budget.service';
import { QueryUtil } from '../query.util';
import { ModelUtil } from '../model.util';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css']
})
export class BudgetComponent implements OnInit {

  month: Date
  urlPrefix = "budget"

  expenses: CategoryExpenses[]
  otherExpenses: CategoryExpenses
  budgets: Budget[]

  constructor(
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => this.setMonth(params));
    this.getBudgets()
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
    this.expenseService.getExpenses(null, query, null, null)
      .subscribe(expenses => this.calculateCategoryExpenses(expenses.values))
  }

  private calculateCategoryExpenses(expenses: Expense[]) {
    this.expenses = this.budgets
      .map(b => this.calculateCategoryExpensesForBudget(expenses, b))
    this.otherExpenses = this.calculateOtherExpenses(expenses)
  }

  private calculateOtherExpenses(expenses: Expense[]) {
    let other = expenses
      .filter(e => this.budgets.filter(b => b.category.name === e.category.name).length == 0)
    let sum = ModelUtil.sumExpenses(other)
    return { category: { name: "Other" }, amount: sum, budget: { amount: 0 } }
  }

  private calculateCategoryExpensesForBudget(expenses: Expense[], budget: Budget) {
    let relevant = ModelUtil.getExpensesWithCategory(expenses, budget.category)
    let sum = ModelUtil.sumExpenses(relevant)
    return { category: budget.category, amount: sum, budget: budget.amount }
  }
}
