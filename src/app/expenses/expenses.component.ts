import {Component, OnInit} from '@angular/core';
import {Expense, Sort, SubList} from '../model';
import {AbstractExpenseService, ExpenseServiceProvider, ExpenseType} from '../expense.service';
import {Observable} from 'rxjs/Observable';
import {DelayedSearch} from '../delayed.search';
import {ActivatedRoute} from '@angular/router';
import {ExpenseSorter, SortDirection, SortField} from '../expenses-table/expenses-table.component';
import {PeriodQuery, QueryUtil} from '../query.util';
import {ExpenseSearch} from '../date-header/date-header.component';
import {extractDate, toBudgetPeriod, View, ViewPeriod} from '../view';
import {ViewService} from '../view.service';
import {BudgetPeriodSwitcher} from '../budget.period';
import {DateUtil, MonthYearUtil} from '../model.util';

@Component({
    selector: 'app-expenses',
    templateUrl: './expenses.component.html',
    styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit, ExpenseSorter, ExpenseSearch {

    isLoadingResults = false;

    expenses: Expense[] = [];

    date: Date;
    view: View;

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
        private viewService: ViewService,
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
        this.date = extractDate(params);
        this.field = params.field;
        this.value = params.value;
        const viewId = params.viewId;
        if (viewId != null) {
            this.viewService.getViewById(viewId)
                .subscribe(view => {
                    this.view = view;
                    this.getExpenses();
                });
        } else {
            this.getExpenses();
        }
    }

    private getSearchBody() {
        if (this.view != null) {
            if (this.view.period === ViewPeriod.FIXED) {
                const queries = [];
                if (this.view.start != null) {
                    queries.push(QueryUtil.afterOrEqualQuery(MonthYearUtil.toDate(this.view.start)));
                }
                if (this.view.end != null) {
                    const after = DateUtil.startOfNextMonth(MonthYearUtil.toDate(this.view.end));
                    queries.push(QueryUtil.beforeQuery(after));
                }
                return queries.length === 0 ? null : queries;
            } else {
                const budgetPeriod = toBudgetPeriod(this.view.period);
                const switcher = new BudgetPeriodSwitcher(budgetPeriod);
                return switcher.switch(new PeriodQuery(), this.date);
            }
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
        return this.expenseService.getExpenses(this.searchTerm, this.getSearchBody(), this.activeSort, null);
    }

    private setExpenses(res: SubList<Expense>) {
        this.isLoadingResults = false;
        this.expenses = res.values;
    }
}
