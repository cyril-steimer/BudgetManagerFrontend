import { Expense, Category, Amount, Budget, CategoryExpenses } from "./model";

export class ModelUtil {

  static sumExpenses(expenses: Expense[]): Amount {
    let sum = expenses
      .map(e => e.amount.amount)
      .reduce((e1, e2) => e1 + e2, 0)
    return { amount: sum }
  }

  static sumBudgets(budgets: Budget[]): Amount {
    let sum = budgets
      .map(b => b.amount.amount)
      .reduce((b1, b2) => b1 + b2, 0)
    return { amount: sum }
  }

  static getExpensesWithCategory(expenses: Expense[], category: Category): Expense[] {
    return expenses
      .filter(e => e.category.name === category.name)
  }

  static emptyExpense(): Expense {
    return {
      id: 0,
      category: { name : null },
      amount: { amount: null },
      date: { timestamp: null },
      name: { name: null }
    }
  }

  static sum(a1: Amount, a2: Amount): Amount {
    return { amount: a1.amount + a2.amount }
  }
}

export class CategoryExpensesCalculator {

  constructor(
    private expenses: Expense[], 
    private budgets: Budget[]) { }

  calculateAllExpenses(): CategoryExpenses[] {
    let result = this.calculateBudgetedExpenses()
    result.push(this.calculateNotBudgetedExpenses())
    result.push(this.calculateTotalExpenses())
    return result
  }

  calculateBudgetedExpenses(): CategoryExpenses[] {
    return this.budgets
      .map(b => this.calculateCategoryExpensesForBudget(b))
  }

  calculateNotBudgetedExpenses(): CategoryExpenses {
    let other = this.expenses
      .filter(e => this.budgets.filter(b => b.category.name === e.category.name).length == 0)
    let sum = ModelUtil.sumExpenses(other)
    return { 
      category: { name: "Not Budgeted" }, 
      amount: sum, 
      budget: { amount: 0 }, 
      expenses: other 
    }
  }

  calculateTotalExpenses(): CategoryExpenses {
    return { 
      category: { name: "Total"}, 
      amount: ModelUtil.sumExpenses(this.expenses),
      budget: ModelUtil.sumBudgets(this.budgets),
      expenses: this.expenses
    }
  }

  private calculateCategoryExpensesForBudget(budget: Budget) {
    let relevant = ModelUtil.getExpensesWithCategory(this.expenses, budget.category)
    let sum = ModelUtil.sumExpenses(relevant)
    return { 
      category: budget.category, 
      amount: sum, 
      budget: budget.amount,
      expenses: relevant
    }
  }
}