import {
    ActualExpense,
    Amount,
    Budget,
    BudgetAmount,
    BudgetInPeriod,
    Category,
    CategoryExpenses,
    Expense, MonthYear,
    ScheduledExpense,
    Timestamp
} from './model';
import {BudgetPeriod} from './budget.period';

export class ModelUtil {

    static sumExpenses(expenses: Expense[]): Amount {
        const sum = expenses
            .map(e => e.amount.amount)
            .reduce((e1, e2) => e1 + e2, 0);
        return {amount: sum};
    }

    static sumBudgets(budgets: BudgetInPeriod[]): Amount {
        const sum = budgets
            .map(b => b.amount.amount)
            .reduce((b1, b2) => b1 + b2, 0);
        return {amount: sum};
    }

    static getExpensesWithCategory<T extends Expense>(expenses: T[], category: Category): T[] {
        return expenses.filter(e => e.budget != null && e.budget.category.name == category.name);
    }

    static emptyExpense(): ActualExpense {
        // TODO Does an empty expense need a budget?
        return {
            id: '',
            amount: {amount: 0},
            date: TimestampUtil.fromDate(new Date()),
            name: {name: ''},
            method: {name: ''},
            author: {name: ''},
            tags: []
        };
    }

    static emptyScheduledExpense(): ScheduledExpense {
        // TODO Does an empty expense need a budget?
        return {
            id: '',
            amount: {amount: 0},
            startDate: TimestampUtil.fromDate(new Date()),
            endDate: null,
            schedule: {
                dayOfMonth: 1
            },
            name: {name: ''},
            method: {name: ''},
            author: {name: ''},
            tags: []
        };
    }

    static toActualExpense(expense: Expense): ActualExpense {
        if (ModelUtil.isActualExpense(expense)) {
            return expense;
        } else if (expense != null) {
            const res = expense as ActualExpense;
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
            id: '',
            category: {name: null},
            amounts: [ModelUtil.emptyBudgetAmount()]
        };
    }

    static emptyBudgetAmount(): BudgetAmount {
        const now = new Date();
        return {
            amount: {amount: 0},
            period: BudgetPeriod.MONTHLY,
            from: {year: now.getFullYear(), month: 1},
            to: {year: now.getFullYear(), month: 12}
        };
    }

    static sum(a1: Amount, a2: Amount): Amount {
        return {amount: a1.amount + a2.amount};
    }
}

export class ExpensesPerCategory {

    constructor(
        private budgeted: CategoryExpenses[],
        private notBudgeted: CategoryExpenses,
        private total: CategoryExpenses) {
    }

    getBudgetedExpenses() {
        return this.budgeted;
    }

    getNotBudgetedExpenses() {
        return this.notBudgeted;
    }

    getTotal() {
        return this.total;
    }

    getAllExpenses() {
        const res: CategoryExpenses[] = [];
        for (const expense of this.budgeted) {
            res.push(expense);
        }
        if (this.notBudgeted.amount.amount > 0) {
            res.push(this.notBudgeted);
        }
        return res;
    }

    getAllExpensesWithTotal() {
        const res = this.getAllExpenses();
        res.push(this.total);
        return res;
    }
}

export class CategoryExpensesCalculator {

    private sorter: (e1: CategoryExpenses, e2: CategoryExpenses) => number = null;

    constructor(
        private expenses: ActualExpense[],
        private budgets: BudgetInPeriod[],
        private period: BudgetPeriod) {
    }


    sortByBudget(): CategoryExpensesCalculator {
        const res = new CategoryExpensesCalculator(this.expenses, this.budgets, this.period);
        res.sorter = (e1, e2) => e2.budget.amount - e1.budget.amount;
        return res;
    }

    sortByExpenses(): CategoryExpensesCalculator {
        const res = new CategoryExpensesCalculator(this.expenses, this.budgets, this.period);
        res.sorter = (e1, e2) => e2.amount.amount - e1.amount.amount;
        return res;
    }

    calculateExpenses(): ExpensesPerCategory {
        const budgeted = this.calculateBudgetedExpenses();
        const notBudgeted = this.calculateNotBudgetedExpenses();
        const total = this.calculateTotalExpenses();
        return new ExpensesPerCategory(budgeted, notBudgeted, total);
    }

    private calculateTotalExpenses(): CategoryExpenses {
        return {
            category: {name: 'Total'},
            amount: ModelUtil.sumExpenses(this.expenses),
            budget: ModelUtil.sumBudgets(this.budgets),
            expenses: this.expenses
        };
    }

    private calculateCategoryExpensesForBudget(budget: BudgetInPeriod): CategoryExpenses {
        const relevant = ModelUtil.getExpensesWithCategory(this.expenses, budget.budget.category);
        const sum = ModelUtil.sumExpenses(relevant);
        return {
            budgetId: budget.budget.id,
            category: budget.budget.category,
            amount: sum,
            budget: budget.amount,
            expenses: relevant
        };
    }

    private calculateBudgetedExpenses(): CategoryExpenses[] {
        const res = this.budgets
            .map(b => this.calculateCategoryExpensesForBudget(b));
        if (this.sorter) {
            return res.sort(this.sorter);
        }
        return res;
    }

    private calculateNotBudgetedExpenses(): CategoryExpenses {
        const other = this.expenses.filter(e => !this.isBudgeted(e));
        const sum = ModelUtil.sumExpenses(other);
        return {
            category: {name: 'Not Budgeted'},
            amount: sum,
            budget: {amount: 0},
            expenses: other
        };
    }

    private isBudgeted(e: Expense): boolean {
        return this.budgets.map(b => b.budget.category)
            .filter(c => e.budget != null && e.budget.category.name === c.name)
            .length > 0;
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

export class MonthYearUtil {
    static fromDate(date: Date): MonthYear {
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1
        };
    }

    static toDate(monthYear: MonthYear): Date{
        return new Date(monthYear.year, monthYear.month - 1);
    }
}

export class DateUtil {
    static startOfNextMonth(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth() + 1);
    }

    static startOfNextYear(date: Date): Date {
        return new Date(date.getFullYear() + 1, 0);
    }

    static startOfPreviousMonth(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth() - 1);
    }

    static startOfPreviousYear(date: Date): Date {
        return new Date(date.getFullYear() - 1, 0);
    }
}

