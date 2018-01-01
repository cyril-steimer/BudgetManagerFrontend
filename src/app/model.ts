export class Expense {
  id: number
  name: string
  amount: number
  category: string
  date: Date
}

export class SubList<T> {
  count: number
  values: T[]
}