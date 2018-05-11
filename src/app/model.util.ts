import { Expense, Category, Amount, Budget, CategoryExpenses } from "./model";
import { BudgetPeriod, BudgetPeriodSwitcher, BudgetConverter } from "./budget.period";

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
			category: { name: "" },
			amount: { amount: 0 },
			date: { timestamp: new Date().getTime() },
			name: { name: "" },
			method: { name: "" },
			tags: []
		}
	}

	static emptyBudget(): Budget {
		return {
			category: { name: null },
			amount: { amount: null },
			period: null
		}
	}

	static sum(a1: Amount, a2: Amount): Amount {
		return { amount: a1.amount + a2.amount }
	}
}

export class CategoryExpensesCalculator {

	private sorter: (e1: CategoryExpenses, e2: CategoryExpenses) => number = null

	constructor(
		private expenses: Expense[], 
		private budgets: Budget[],
		private period: BudgetPeriod) {

			let converter = new BudgetConverter()
			this.budgets = this.budgets.map(b => converter.convert(b, this.period))
	}

	
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

	calculateAllExpenses(): CategoryExpenses[] {
		let result = this.calculateBudgetedExpenses()
		let notBudgeted = this.calculateNotBudgetedExpenses();
		if (notBudgeted.amount.amount > 0) {
			result.push(notBudgeted);
		}
		result.push(this.calculateTotalExpenses())
		return result
	}

	calculateBudgetedExpenses(): CategoryExpenses[] {
		let res = this.budgets
			.map(b => this.calculateCategoryExpensesForBudget(b))
		if (this.sorter) {
			return res.sort(this.sorter)
		}
		return res
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

	private calculateCategoryExpensesForBudget(budget: Budget): CategoryExpenses {
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