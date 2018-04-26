import { BudgetPeriod } from "./budget.period";

export class Expense {
  id: number
  name: Name
  amount: Amount
  category: Category
  date: Timestamp
  method?: PaymentMethod
}

export class Budget {
  category: Category
  amount: Amount
  period: BudgetPeriod
}

export class CategoryExpenses {
  category: Category
  amount: Amount
  budget: Amount
  expenses: Expense[]
}

export class PaymentMethod {
  name: string
}

export class Amount {
  amount: number
}

export class Name {
  name: string
}

export class Category {
  name: string
}

export class Timestamp {
  timestamp: number
}

export class SubList<T> {
  count: number
  values: T[]
}

export class Pagination {
  from: number
  count: number
}

export class Sort {
  field: string
  direction: string
}