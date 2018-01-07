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

  static sortByDateDesc(expenses: Expense[]) {
    return expenses
      .sort((e1, e2) => ModelUtil.compare(e1.date, e2.date))
  }

  private static compare(d1: Date, d2: Date): number {
    return (d2 < d1 ? -1 : (d1 == d2) ? 0 : 1)
  }
}