import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {SubList} from './model';
import {View, ViewType} from './view';

@Injectable()
export class ViewService {

    private viewUrl = '/api/v1/view';

    constructor(private http: HttpClient) {
    }

    getViews(type: ViewType): Observable<SubList<View>> {
        const url = `${this.viewUrl}/type/${type}`;
        return this.http.get<SubList<View>>(url);
    }

    getViewById(id: string): Observable<View> {
        const url = `${this.viewUrl}/id/${id}`;
        return this.http.get<View>(url);
    }
}
