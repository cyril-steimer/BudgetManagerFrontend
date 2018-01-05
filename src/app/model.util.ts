import { Expense, Category, Amount, Budget } from "./model";

export class ModelUtil {

  static sumExpenses(expenses: Expense[]): Amount {
    let sum = expenses
      .map(e => e.amount.amount)
      .reduce((prev, next) => prev + next, 0)
    return { amount: sum }
  }

  static getExpensesWithCategory(expenses: Expense[], category: Category): Expense[] {
    return expenses
      .filter(e => e.category.name === category.name)
  }

  static sum(a1: Amount, a2: Amount): Amount {
    return { amount: a1.amount + a2.amount }
  }
}