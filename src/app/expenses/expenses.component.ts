import {Component, OnInit} from '@angular/core';
import {Expense, Sort, SubList} from '../model';
import {AbstractExpenseService, ExpenseServiceProvider, ExpenseType} from '../expense.service';
import {Observable} from 'rxjs/Observable';
import {DelayedSearch} from '../delayed.search';
import {ActivatedRoute} from '@angular/router';
import {ExpenseSorter, SortDirection, SortField} from '../expenses-table/expenses-table.component';
import {BudgetPeriodSwitcher, DateExtractor} from '../budget.period';
import {PeriodQuery, QueryUtil} from '../query.util';
import {ExpenseSearch} from '../date-header/date-header.component';

@Component({
    selector: 'app-expenses',
    templateUrl: './expenses.component.html',
    styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit, ExpenseSorter, ExpenseSearch {

    isLoadingResults = false;

    expenses: Expense[] = [];

    date: Date;
    switcher: BudgetPeriodSwitcher;
    urlPrefix = 'expenses';

    field: string = null;
    value: string = null;

    sorter = this;
    expenseType: ExpenseType;
    private delayedSearch = new DelayedSearch(300, term => this.setSearchTerm(term));
    private searchTerm = '';
    private activeSort: Sort = {field: 'date', direction: 'desc'};
    private expenseService: AbstractExpenseService<Expense>;

    constructor(
        private expenseServiceProvider: ExpenseServiceProvider,
        private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.expenseType = ExpenseType.forRoute(this.route);
        this.expenseService = this.expenseServiceProvider.getService(this.expenseType);
        this.route.params.subscribe(params => this.update(params));
        this.getExpenses();
    }

    sort(field: SortField, dir: SortDirection) {
        this.activeSort = {field: field.field, direction: dir.dir};
        this.getExpenses();
    }

    removeSort() {
        this.activeSort = null;
        this.getExpenses();
    }

    search(term: string) {
        this.delayedSearch.set(term);
    }

    private update(params: { [key: string]: any }) {
        const period = DateExtractor.getBudgetPeriod(params);
        if (period) {
            this.switcher = new BudgetPeriodSwitcher(period);
            this.date = this.switcher.switch(new DateExtractor(), params);
        } else {
            this.switcher = null;
            this.date = null;
        }
        this.field = params.field;
        this.value = params.value;
        this.getExpenses();
    }

    private getSearchBody() {
        if (this.date) {
            return this.switcher.switch(new PeriodQuery(), this.date);
        } else if (this.field) {
            return QueryUtil.fieldQuery(this.field, this.value);
        }
        return null;
    }

    private setSearchTerm(term: string) {
        this.searchTerm = term;
        this.getExpenses();
    }

    private getExpenses() {
        this.isLoadingResults = true;
        const observable = this.getExpensesObservable();
        observable.subscribe(expenses => this.setExpenses(expenses));
    }

    private getExpensesObservable(): Observable<SubList<Expense>> {
        return this.expenseService.getExpenses(
            this.searchTerm, this.getSearchBody(), this.activeSort, null);
    }

    private setExpenses(res: SubList<Expense>) {
        this.isLoadingResults = false;
        this.expenses = res.values;
    }
}
