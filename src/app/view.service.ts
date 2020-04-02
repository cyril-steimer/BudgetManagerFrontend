import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {SubList} from './model';
import {BudgetView} from './view';

@Injectable()
export class ViewService {

    private budgetViewUrl = '/api/v1/view/budget';

    constructor(private http: HttpClient) {
    }

    getBudgetViews(): Observable<SubList<BudgetView>> {
        return this.http.get<SubList<BudgetView>>(this.budgetViewUrl);
    }

    getBudgetViewById(id: string): Observable<BudgetView> {
        const url = `${this.budgetViewUrl}/id/${id}`;
        return this.http.get<BudgetView>(url);
    }
}
