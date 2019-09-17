import { BudgetPeriod } from "./budget.period";

export class Expense {
	id: string
	name: Name
	amount: Amount
	category: Category
	method: PaymentMethod
	author: Author
	tags: Tag[]
}

export class ExpenseTemplate extends Expense {}

export class ActualExpense extends Expense {
	date: Timestamp
}

export class ScheduledExpense extends Expense {
	startDate: Timestamp
	endDate: Timestamp
	schedule: WeeklySchedule | MonthlySchedule
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
	expenses: ActualExpense[]
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
	year: number
	month: number
	day: number
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

export class WeeklySchedule {
	dayOfWeek: string
}

export class MonthlySchedule {
	dayOfMonth: number
}
