import {Component} from '@angular/core';
import {Expense} from '../model';
import {ExpenseService} from '../expense.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

    cards: Card[] = [];

    filteredExpenses: Expense[] = null;

    constructor(private expenseService: ExpenseService) {
        this.initCards();
    }

    searchExpenses(text: string) {
        if (text.length == 0) {
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
        return {
            title: 'Expenses',
            content: 'View the list of all expenses during a certain time frame',
            links: [
                {
                    name: 'This Month',
                    url: `/expenses/year/${date.getFullYear()}/month/${date.getMonth()}`
                },
                {
                    name: 'This Year',
                    url: `/expenses/year/${date.getFullYear()}`
                },
                {
                    name: 'All Time',
                    url: '/expenses'
                }
            ]
        };
    }

    private budget(date: Date): Card {
        return {
            title: 'Budget',
            content: 'Check the state of your budget during the current month or year',
            links: [
                {
                    name: 'This Month',
                    url: `/budget/year/${date.getFullYear()}/month/${date.getMonth()}`
                },
                {
                    name: 'This Year',
                    url: `/budget/year/${date.getFullYear()}`
                }
            ]
        };
    }

    private importExport(): Card {
        return {
            title: 'Import/Export',
            content: 'Import or export all expende/budget data. The data can then be used in another instance of the budget manager',
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
