import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ActualExpense, BudgetInPeriod, CategoryExpenses} from '../model';
import {ExpenseService} from '../expense.service';
import {BudgetService} from '../budget.service';
import {PeriodQuery} from '../query.util';
import {CategoryExpensesCalculator, ExpensesPerCategory, TimestampUtil} from '../model.util';
import {BeforeLeave} from '../expenses-table/expenses-table.component';
import {
    BudgetPeriodSwitch,
    BudgetPeriodSwitcher,
    DateExtractor,
    DaysInPeriod,
    DaysSinceStart,
    isInPeriod,
    MonthYearPeriodCalculator
} from '../budget.period';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import {ChartData, ChartDataSets, ChartOptions, ChartTooltipItem} from 'chart.js';
import {newFilledArray, range} from '../util';

@Component({
    selector: 'app-budget',
    templateUrl: './budget.component.html',
    styleUrls: ['./budget.component.css']
})
export class BudgetComponent implements OnInit, BeforeLeave {

    modalOptions: NgbModalOptions = {
        size: 'lg',
        centered: true
    };
    modal: NgbModalRef;

    expensesPerCategory: ExpensesPerCategory;
    expensesForTable: CategoryExpenses[];

    detail: CategoryExpenses;

    callback = this;

    pieChartData: number[];
    pieChartLabels: string[];
    chartOptions: ChartOptions = {
        tooltips: {
            callbacks: {
                label: function (tooltipItem: ChartTooltipItem, data: ChartData) {
                    const label = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return 'CHF' + (<Number>label).toFixed(2);
                }
            }
        }
    };

    lineCharts: CategoryExpensesLineChartData[] = [];

    date: Date;
    switcher: BudgetPeriodSwitcher;
    urlPrefix = 'budget';

    constructor(
        private expenseService: ExpenseService,
        private budgetService: BudgetService,
        private route: ActivatedRoute,
        private modalService: NgbModal) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => this.update(params));
        this.getBudgets();
    }

    beforeLeave() {
        //The modal would not close correctly on changing the URL
        //due to the background not being contained in the 'app-root' tag
        this.modal.close();
    }

    showDetails(expense: CategoryExpenses, content: any) {
        if (expense.expenses.length > 0) {
            this.detail = expense;
            this.modal = this.modalService.open(content, this.modalOptions);
        }
    }

    private piePlotData(calc: CategoryExpensesCalculator) {
        const expenses = this.getExpensesSortedByExpensesWithoutTotal(calc);
        return expenses.map(e => e.amount.amount);
    }

    private piePlotLabels(calc: CategoryExpensesCalculator) {
        const expenses = this.getExpensesSortedByExpensesWithoutTotal(calc);
        return expenses.map(e => e.category.name);
    }

    private getExpensesSortedByExpensesWithoutTotal(calc: CategoryExpensesCalculator) {
        const res = calc.sortByExpenses().calculateExpenses();
        return res.getAllExpenses();
    }

    private update(params: any) {
        const period = DateExtractor.getBudgetPeriod(params);
        this.switcher = new BudgetPeriodSwitcher(period);
        this.date = this.switcher.switch(new DateExtractor(), params);
        this.getBudgets();
    }

    private getBudgets() {
        const period = this.switcher.switch(new MonthYearPeriodCalculator(), this.date);
        this.budgetService.getBudgetsInPeriod(period)
            .subscribe(budgets => this.getExpenses(budgets.values));
    }

    private getExpenses(budgets: BudgetInPeriod[]) {
        const query = this.switcher.switch(new PeriodQuery(), this.date);
        const sort = {field: 'date', direction: 'desc'};
        this.expenseService.getExpenses(null, query, sort, null)
            .subscribe(expenses => this.init(expenses.values, budgets));
    }

    private init(expenses: ActualExpense[], budgets: BudgetInPeriod[]) {
        const calc = new CategoryExpensesCalculator(expenses, budgets, this.switcher.getPeriod());
        this.expensesPerCategory = calc.sortByBudget().calculateExpenses();
        this.expensesForTable = this.expensesPerCategory.getAllExpensesWithTotal();
        this.pieChartData = this.piePlotData(calc);
        this.pieChartLabels = this.piePlotLabels(calc);
        this.lineCharts = this.expensesForTable
            .map(e => this.newLineChartData(e));
    }

    private newLineChartData(expenses: CategoryExpenses) {
        return new CategoryExpensesLineChartData(this.date, this.switcher, expenses);
    }
}

const LINE_CONFIG: ChartDataSets = {
    lineTension: 0, // No bezier curves, straight lines
    pointRadius: 0, // Don't show points, just lines
    pointHitRadius: 10, // Still want to hover over points
    fill: false // Don't fill the area under the line
};

class BurndownLabels implements BudgetPeriodSwitch<Date, string[]> {

    caseMonthly(arg: Date): string[] {
        const days = new DaysInPeriod().caseMonthly(arg);
        return range(1, days + 1).map(v => '' + v);
    }

    caseYearly(arg: Date): string[] {
        const days = new DaysInPeriod().caseYearly(arg);
        return range(1, days + 1).map(d => new Date(arg.getFullYear(), 0, d))
            .map(d => d.getMonthName() + ' ' + d.getDate());
    }
}

class CategoryExpensesLineChartData {

    category: string;
    data: ChartDataSets[];
    labels: string[];

    constructor(private date: Date, private switcher: BudgetPeriodSwitcher, private expenses: CategoryExpenses) {
        this.category = expenses.category.name;
        this.data = this.getData();
        this.labels = this.getLabels();
    }

    private getData(): ChartDataSets[] {
        const res = [Object.assign({data: this.getBudgetData(), label: 'Budget'}, LINE_CONFIG)];
        res.push(Object.assign({data: this.getExpenseData(), label: 'Expenses'}, LINE_CONFIG));
        if (this.needsTrend()) {
            res.push(Object.assign(
                {data: this.getTrendData(), label: 'Trend', borderDash: [5, 5]},
                LINE_CONFIG));
        }
        return res;
    }

    private getLabels(): string[] {
        return this.switcher.switch(new BurndownLabels(), this.date);
    }

    private getBudgetData(): number[] {
        const days = this.numDays();
        return newFilledArray(days, 0).map((_, i) => (this.expenses.budget.amount * (i + 1)) / days);
    }

    private getExpenseData(): number[] {
        const days = this.daysSinceStart();
        const res = newFilledArray(days, 0);
        for (const expense of this.expenses.expenses) {
            const date = TimestampUtil.toDate(expense.date);
            const offset = this.switcher.switch(new DaysSinceStart(), date);
            for (let i = offset; i <= days; i++) {
                res[i] = res[i] + expense.amount.amount;
            }
        }
        return res;
    }

    private getTrendData(): number[] {
        const days = this.switcher.switch(new DaysSinceStart(), new Date());
        const total = this.expenses.amount.amount;
        const averageSpend = total / days;
        return newFilledArray(this.numDays(), 0).map((_, i) => (i + 1) * averageSpend);
    }

    private daysSinceStart(): number {
        const curr = new Date();
        if (isInPeriod(this.switcher, this.date, curr)) {
            return this.switcher.switch(new DaysSinceStart(), new Date());
        } else if (curr.getTime() < this.date.getTime()) {
            return 0;
        }
        return this.numDays();
    }

    private needsTrend(): boolean {
        const days = this.daysSinceStart();
        return days > 0 && days < this.numDays();
    }

    private numDays() {
        return this.switcher.switch(new DaysInPeriod(), this.date);
    }
}
