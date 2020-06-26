import {Component} from '@angular/core';
import {Expense} from '../model';
import {ExpenseService} from '../expense.service';
import {ViewService} from '../view.service';
import {getViewUrl, View, ViewType} from '../view';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

    cards: Card[] = [];

    filteredExpenses: Expense[] = null;

    constructor(private expenseService: ExpenseService, private viewService: ViewService) {
        this.initCards();
    }

    searchExpenses(text: string) {
        if (text.length === 0) {
            this.filteredExpenses = null;
        } else {
            this.expenseService.getExpenses(text)
                .subscribe(expenses => this.filteredExpenses = expenses.values);
        }
    }

    private initCards() {
        const date = new Date();
        this.cards.push(this.expenses(date));
        this.cards.push(this.budget(date));
        this.cards.push(this.importExport());
        this.cards.push(this.templates());
        this.cards.push(this.scheduledExpenses());
    }

    private templates(): Card {
        return {
            title: 'Templates',
            content: 'View the list of templates',
            links: [
                {
                    name: 'All Templates',
                    url: '/templates'
                }
            ]
        };
    }

    private scheduledExpenses(): Card {
        return {
            title: 'Scheduled Expenses',
            content: 'View the list of scheduled expenses',
            links: [
                {
                    name: 'All Scheduled Expenses',
                    url: '/schedules'
                }
            ]
        };
    }

    private expenses(date: Date): Card {
        const res: Card = {
            title: 'Expenses',
            content: 'View the list of all expenses during a certain time',
            links: []
        };
        this.viewService.getViews(ViewType.EXPENSE_VIEW)
            .subscribe(val => res.links = this.viewsToLinks(val.values));
        return res;
    }

    private viewToLink(view: View, date: Date): Link {
        return {
            name: view.title.title,
            url: getViewUrl(view, date)
        };
    }

    private viewsToLinks(views: View[]): Link[] {
        const now = new Date();
        // TODO Check start/end
        return views.map(view => this.viewToLink(view, now));
    }

    private budget(date: Date): Card {
        const res: Card = {
            title: 'Budget',
            content: 'Check the state of your budget',
            links: []
        };
        this.viewService.getViews(ViewType.BUDGET_VIEW)
            .subscribe(val => res.links = this.viewsToLinks(val.values));
        return res;
    }

    private importExport(): Card {
        return {
            title: 'Import/Export',
            content: 'Import or export all expense/budget data. The data can then be used in another instance of the budget manager',
            links: [
                {
                    name: 'Import/Export',
                    url: '/importexport'
                }
            ]
        };
    }
}

class Card {
    title: string;
    content: string;
    links: Link[];
}

class Link {
    name: string;
    url: string;
}
