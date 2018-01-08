export class Expense {
  id: number
  name: Name
  amount: Amount
  category: Category
  date: Timestamp
}

export class Budget {
  category: Category
  amount: Amount
}

export class CategoryExpenses {
  category: Category
  amount: Amount
  budget: Amount
  expenses: Expense[]
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