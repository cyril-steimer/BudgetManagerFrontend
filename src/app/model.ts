import { BudgetPeriod } from "./budget.period";

export class Expense {
	id: string
	name: Name
	amount: Amount
	category: Category
	date: Timestamp
	method: PaymentMethod
	author: Author
	tags: Tag[]
}

export class Budget {
	category: Category
	amounts: BudgetAmount[]
}

export class BudgetAmount {
	amount: Amount
	period: BudgetPeriod
	from: MonthYear
	to: MonthYear
}

export class MonthYear {
	month: number
	year: number
}

export class MonthYearPeriod {
	from: MonthYear
	to: MonthYear
}

export class BudgetInPeriod {
	category: Category
	amount: Amount
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

export class Tag {
	name: string
}

export class Author {
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