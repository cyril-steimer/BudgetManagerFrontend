import { Expense, Category, Amount, Budget, CategoryExpenses, BudgetInPeriod, BudgetAmount, ActualExpense, Timestamp, ScheduledExpense } from "./model";
import { BudgetPeriod } from "./budget.period";

export class ModelUtil {

	static sumExpenses(expenses: Expense[]): Amount {
		let sum = expenses
			.map(e => e.amount.amount)
			.reduce((e1, e2) => e1 + e2, 0)
		return { amount: sum }
	}

	static sumBudgets(budgets: BudgetInPeriod[]): Amount {
		let sum = budgets
			.map(b => b.amount.amount)
			.reduce((b1, b2) => b1 + b2, 0)
		return { amount: sum }
	}

	static getExpensesWithCategory<T extends Expense>(expenses: T[], category: Category): T[] {
		return expenses
			.filter(e => e.category.name === category.name)
	}

	static emptyExpense(): ActualExpense {
		return {
			id: "",
			category: { name: "" },
			amount: { amount: 0 },
			date: TimestampUtil.fromDate(new Date()),
			name: { name: "" },
			method: { name: "" },
			author: { name: "" },
			tags: []
		}
	}

	static emptyScheduledExpense(): ScheduledExpense {
		return {
			id: "",
			category: { name: "" },
			amount: { amount: 0 },
			startDate: TimestampUtil.fromDate(new Date()),
			endDate: null,
			schedule: {
				dayOfMonth: 1
			},
			name: { name: "" },
			method: { name: "" },
			author: { name: "" },
			tags: []
		}
	}

	static toActualExpense(expense: Expense): ActualExpense {
		if (ModelUtil.isActualExpense(expense)) {
			return expense;
		} else if (expense != null) {
			let res = expense as ActualExpense;
			res.date = TimestampUtil.fromDate(new Date());
			return res;
		}
		return null;
	}

	static isActualExpense(expense: Expense): expense is ActualExpense {
		return expense != null && (expense as ActualExpense).date != null;
	}

	static emptyBudget(): Budget {
		return {
			category: { name: null },
			amounts: [ ModelUtil.emptyBudgetAmount() ]
		};
	}

	static emptyBudgetAmount(): BudgetAmount {
		let now = new Date()
		return {
			amount: { amount: 0 },
			period: BudgetPeriod.MONTHLY,
			from: { year: now.getFullYear(), month: 1 },
			to: { year: now.getFullYear(), month: 12 }
		};
	}

	static sum(a1: Amount, a2: Amount): Amount {
		return { amount: a1.amount + a2.amount }
	}
}

export class ExpensesPerCategory {
	
	constructor(
		private budgeted: CategoryExpenses[],
		private notBudgeted: CategoryExpenses,
		private total: CategoryExpenses) { }

	getBudgetedExpenses() {
		return this.budgeted
	}

	getNotBudgetedExpenses() {
		return this.notBudgeted;
	}

	getTotal() {
		return this.total;
	}

	getAllExpenses() {
		let res: CategoryExpenses[] = []
		for (let expense of this.budgeted) {
			res.push(expense)
		}
		if (this.notBudgeted.amount.amount > 0) {
			res.push(this.notBudgeted)
		}
		return res;
	}

	getAllExpensesWithTotal() {
		let res = this.getAllExpenses()
		res.push(this.total)
		return res
	}
}

export class CategoryExpensesCalculator {

	private sorter: (e1: CategoryExpenses, e2: CategoryExpenses) => number = null

	constructor(
		private expenses: ActualExpense[], 
		private budgets: BudgetInPeriod[],
		private period: BudgetPeriod) { }

	
	sortByBudget(): CategoryExpensesCalculator {
		let res = new CategoryExpensesCalculator(this.expenses, this.budgets, this.period)
		res.sorter = (e1, e2) => e2.budget.amount - e1.budget.amount
		return res
	}

	sortByExpenses(): CategoryExpensesCalculator {
		let res = new CategoryExpensesCalculator(this.expenses, this.budgets, this.period)
		res.sorter = (e1, e2) => e2.amount.amount - e1.amount.amount
		return res
	}

	calculateExpenses(): ExpensesPerCategory {
		let budgeted = this.calculateBudgetedExpenses()
		let notBudgeted = this.calculateNotBudgetedExpenses()
		let total = this.calculateTotalExpenses()
		return new ExpensesPerCategory(budgeted, notBudgeted, total)
	}

	private calculateTotalExpenses(): CategoryExpenses {
		return { 
			category: { name: "Total"}, 
			amount: ModelUtil.sumExpenses(this.expenses),
			budget: ModelUtil.sumBudgets(this.budgets),
			expenses: this.expenses
		}
	}

	private calculateCategoryExpensesForBudget(budget: BudgetInPeriod): CategoryExpenses {
		let relevant = ModelUtil.getExpensesWithCategory(this.expenses, budget.category)
		let sum = ModelUtil.sumExpenses(relevant)
		return { 
			category: budget.category, 
			amount: sum, 
			budget: budget.amount,
			expenses: relevant
		}
	}

	private calculateBudgetedExpenses(): CategoryExpenses[] {
		let res = this.budgets
			.map(b => this.calculateCategoryExpensesForBudget(b))
		if (this.sorter) {
			return res.sort(this.sorter)
		}
		return res
	}

	private calculateNotBudgetedExpenses(): CategoryExpenses {
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
}

export class TimestampUtil {
	static fromDate(date: Date): Timestamp {
		return {
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate()
		};
	}

	static toDate(ts: Timestamp): Date {
		return new Date(ts.year, ts.month - 1, ts.day);
	}
}
