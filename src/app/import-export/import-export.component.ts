import {Component} from '@angular/core';
import * as saveAs from 'file-saver';
import {ImportExportService} from '../import-export.service';

@Component({
	selector: 'app-import-export',
	templateUrl: './import-export.component.html',
	styleUrls: ['./import-export.component.css']
})
export class ImportExportComponent {

	constructor (private importExportService: ImportExportService) { }

	export () {
		this.importExportService.export()
			.subscribe((json) => {
				let blob = new Blob([json], {type: 'application/json;charset=utf-8'});
				saveAs.saveAs(blob, 'export.json');
			});
	}

	import () {
		let input = document.getElementById('import-file') as HTMLInputElement;
		let file = input.files.length == 1 ? input.files[0] : null;
		if (file == null) {
			alert('Please specify a file to import');
			return;
		}
		let reader = new FileReader();
		reader.onload = () => this.doImport(reader.result as string);
		reader.readAsText(file, 'utf-8');
	}

	private doImport (content: string) {
		this.importExportService.import(content)
			.subscribe(() => alert('Import done!'));
	}
}
