import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {Author, PaymentMethod, Tag} from './model';


const METHOD_URL = '/api/v1/paymentmethod';
const TAG_URL = '/api/v1/tag';
const AUTHOR_URL = '/api/v1/author';

@Injectable()
export class AutocompleteService {

    constructor(private http: HttpClient) {
    }

    getPaymentMethods(): Observable<PaymentMethod[]> {
        return this.http.get<PaymentMethod[]>(METHOD_URL);
    }

    getTags(): Observable<Tag[]> {
        return this.http.get<Tag[]>(TAG_URL);
    }

    getAuthors(): Observable<Author[]> {
        return this.http.get<Author[]>(AUTHOR_URL);
    }
}
