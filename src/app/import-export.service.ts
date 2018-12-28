import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

const IMPORT_URL = "/api/v1/import";
const EXPORT_URL = "/api/v1/export";

@Injectable()
export class ImportExportService {

	constructor(private http: HttpClient) { }

	export(): Observable<string> {
		return this.http.get(EXPORT_URL, { responseType: 'text'});
	}

	import(json: string): Observable<any> {
		return this.http.post(IMPORT_URL, json, { responseType: 'text' });
	}
}
