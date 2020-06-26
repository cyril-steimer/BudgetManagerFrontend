import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BudgetPeriodSwitch, BudgetPeriodSwitcher, NextPeriod, PreviousPeriod} from '../budget.period';
import {extractDate, getViewLabel, getViewUrl, toBudgetPeriod, View, ViewPeriod} from '../view';
import {ViewService} from '../view.service';

export interface ExpenseSearch {
    search(text: string): void;
}

@Component({
    selector: 'app-date-header',
    templateUrl: './date-header.component.html',
    styleUrls: ['./date-header.component.css']
})
export class DateHeaderComponent implements OnInit {

    @Input() date: Date;
    @Input() view: View;
    @Input() search: ExpenseSearch;

    nextDateLink: DateLink;
    dateLink: DateLink;
    prevDateLink: DateLink;

    drillUp: DateLink;
    drillDown: DateLink[];

    constructor(private viewService: ViewService, private route: ActivatedRoute) {
    }

    ngOnInit() {
        if (this.date != null) {
            this.update(this.date);
        }
        this.route.params.subscribe(params => this.updateDate(params));
    }

    doSearch(text: string) {
        if (this.search) {
            this.search.search(text);
        }
    }

    private updateDate(params: any) {
        if (this.date != null) {
            const date = extractDate(params);
            this.update(date);
        }
    }

    private update(date: Date) {
        this.dateLink = DateLink.create(this.view, date);
        if (this.view.period === ViewPeriod.FIXED || date == null) {
            this.nextDateLink = null;
            this.prevDateLink = null;
            this.drillUp = null;
            this.drillDown = null;
        } else {
            const switcher = new BudgetPeriodSwitcher(toBudgetPeriod(this.view.period));

            const nextDate = switcher.switch(new NextPeriod(), date);
            this.nextDateLink = DateLink.create(this.view, nextDate);

            const prevDate = switcher.switch(new PreviousPeriod(), date);
            this.prevDateLink = DateLink.create(this.view, prevDate);

            if (this.view.drillUpViewId != null) {
                this.viewService.getViewById(this.view.drillUpViewId)
                    .subscribe(drillUp => this.drillUp = switcher.switch(new ParentLink(), [drillUp, date]));
            }
            if (this.view.drillDownViewId != null) {
                this.viewService.getViewById(this.view.drillDownViewId)
                    .subscribe(drillDown => this.drillDown = switcher.switch(new ChildrenLinks(), [drillDown, date]));
            }
        }
    }
}

type ViewDate = [View, Date];

class DateLink {
    label: string;
    url: string;

    static create(view: View, date: Date): DateLink {
        return {
            label: getViewLabel(view, date),
            url: getViewUrl(view, date)
        };
    }
}

class ChildrenLinks implements BudgetPeriodSwitch<ViewDate, DateLink[]> {

    caseMonthly(arg: ViewDate): DateLink[] {
        return null; // There is no finer view than 'monthly'
    }

    caseYearly(arg: ViewDate): DateLink[] {
        const result = [];
        for (let month = 0; month < 12; month++) {
            const date = new Date(arg[1].getFullYear(), month);
            result.push(DateLink.create(arg[0], date));
        }
        return result;
    }
}

class ParentLink implements BudgetPeriodSwitch<ViewDate, DateLink> {

    caseMonthly(arg: ViewDate): DateLink {
        const year = new Date(arg[1].getFullYear(), 0);
        return DateLink.create(arg[0], year);
    }

    caseYearly(arg: ViewDate): DateLink {
        return null; // There is no coarser view than 'yearly'
    }
}
