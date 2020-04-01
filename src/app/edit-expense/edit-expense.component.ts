import {Component, Injectable, OnInit} from '@angular/core';
import {ActualExpense, Budget, Expense, ExpenseTemplate, MonthlySchedule, ScheduledExpense, Timestamp, WeeklySchedule} from '../model';
import {AbstractExpenseService, ExpenseServiceProvider, ExpenseType} from '../expense.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {ModelUtil, TimestampUtil} from '../model.util';
import {Observable} from 'rxjs/Observable';
import {BudgetService} from '../budget.service';
import {NgbDateAdapter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {AutocompleteService} from '../autocomplete.service';
import {of} from 'rxjs/observable/of';
import {range} from '../util';

@Injectable()
export class NgbDateTimestampAdapter extends NgbDateAdapter<Timestamp> {

    fromModel(value: Timestamp): NgbDateStruct {
        return value;
    }

    toModel(date: NgbDateStruct): Timestamp {
        return date;
    }
}

@Component({
    selector: 'app-edit-expense',
    templateUrl: './edit-expense.component.html',
    styleUrls: ['./edit-expense.component.css'],
    providers: [{provide: NgbDateAdapter, useClass: NgbDateTimestampAdapter}]
})
export class EditExpenseComponent implements OnInit {

    expense: Expense = null;
    newExpense = true;

    scheduleType: 'monthly' | 'weekly' = 'monthly';
    monthDays = range(1, 32);
    scheduleMonthDay = 1;
    weekDays = range(1, 8);
    scheduleWeekDay = 'MONDAY';

    budgets: Budget[] = [];
    selectedBudgetId: string = null;
    expenseType: ExpenseType;
    saveAsTemplate = false;
    private paymentMethods: string[] = [];
    private tags: string[] = [];
    private authors: string[] = [];
    private expenseService: AbstractExpenseService<Expense>;

    constructor(
        private expenseServiceProvider: ExpenseServiceProvider,
        private autocompleteService: AutocompleteService,
        private budgetService: BudgetService,
        private route: ActivatedRoute,
        private location: Location) {
    }

    methodTypeahead = (text$: Observable<string>) =>
        text$
            .debounceTime(200)
            .distinctUntilChanged()
            .map(term => this.paymentMethods.filter(v => v.indexOf(term) > -1));

    tagTypeahead = (text$: Observable<string>) =>
        text$
            .debounceTime(200)
            .distinctUntilChanged()
            .map(term => this.tags.filter(v => v.indexOf(term) > -1));

    authorTypeahead = (text$: Observable<string>) =>
        text$
            .debounceTime(200)
            .distinctUntilChanged()
            .map(term => this.authors.filter(v => v.indexOf(term) > -1));

    ngOnInit() {
        this.expenseType = ExpenseType.forRoute(this.route);
        this.expenseService = this.expenseServiceProvider.getService(this.expenseType);
        this.route.data.subscribe((data: { expense: Expense }) => {
            if (this.expenseType == ExpenseType.EXPENSE) {
                this.expense = this.initForActualExpense(data.expense);
            } else if (this.expenseType == ExpenseType.TEMPLATE) {
                this.expense = this.initForExpenseTemplate(data.expense);
            } else if (this.expenseType == ExpenseType.SCHEDULE) {
                this.expense = this.initForScheduledExpense(data.expense);
            }
            const snapshot = this.route.snapshot;
            this.newExpense = snapshot.url[0].path == 'add';
            this.selectedBudgetId = this.expense.budget == null ? null : this.expense.budget.id;
        });
        this.budgetService.getBudgets()
            .subscribe(budgets => this.budgets = budgets.values);
        this.autocompleteService.getPaymentMethods()
            .subscribe(methods => this.paymentMethods = methods.map(m => m.name));
        this.autocompleteService.getTags()
            .subscribe(tags => this.tags = tags.map(t => t.name));
        this.autocompleteService.getAuthors()
            .subscribe(authors => this.authors = authors.map(t => t.name));
    }

    back() {
        this.location.back();
    }

    submit() {
        this.doSubmit().then(() => this.back());
    }

    delete() {
        this.expenseService.deleteExpense(this.expense)
            .subscribe(() => this.back());
    }

    removeTag(tag: string) {
        this.expense.tags = this.expense.tags.filter(t => t.name != tag);
    }

    addTag(event: KeyboardEvent, tag: string) {
        //Ensures that if the auto-complete window is open, enter
        //is not wrongly interpreted to add a tag.
        if ((<Element>event.currentTarget).className.indexOf('open') > -1) {
            return;
        }
        if (tag.length > 0
            && this.expense.tags.findIndex(t => t.name == tag) == -1) {
            this.expense.tags.push({'name': tag});
        }
    }

    private initForActualExpense(expense: Expense): ActualExpense {
        const res = expense as ActualExpense;
        if (res == null) {
            return ModelUtil.emptyExpense();
        }
        if (res.date == null) {
            res.date = TimestampUtil.fromDate(new Date());
        }
        return res;
    }

    private initForExpenseTemplate(expense: Expense): ExpenseTemplate {
        return expense == null ? ModelUtil.emptyExpense() : expense;
    }

    private initForScheduledExpense(expense: Expense): ScheduledExpense {
        const res = expense == null ? ModelUtil.emptyScheduledExpense() : expense as ScheduledExpense;
        if ((res.schedule as MonthlySchedule).dayOfMonth != null) {
            this.scheduleType = 'monthly';
            this.scheduleMonthDay = (res.schedule as MonthlySchedule).dayOfMonth;
        } else {
            this.scheduleType = 'weekly';
            this.scheduleWeekDay = (res.schedule as WeeklySchedule).dayOfWeek;
        }
        return res;
    }

    private async doSubmit(): Promise<any> {
        this.expense.budget = this.budgets.filter(b => b.id == this.selectedBudgetId)[0];
        if (this.expenseType == ExpenseType.SCHEDULE) {
            if (this.scheduleType == 'monthly') {
                (this.expense as ScheduledExpense).schedule = {dayOfMonth: this.scheduleMonthDay};
            } else {
                (this.expense as ScheduledExpense).schedule = {dayOfWeek: this.scheduleWeekDay};
            }
        }
        let saveAsTemplate: Observable<any> = of();
        if (this.saveAsTemplate) {
            saveAsTemplate = this.expenseServiceProvider.getTemplateService().addExpense(this.expense);
        }
        await saveAsTemplate.toPromise();
        if (this.newExpense) {
            return this.expenseService.addExpense(this.expense).toPromise();
        }
        return this.expenseService.updateExpense(this.expense).toPromise();
    }
}
