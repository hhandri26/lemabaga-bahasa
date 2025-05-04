/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @angular-eslint/component-class-suffix */
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
@Component({
	selector: 'formly-field-ckeditor-input',
	template: `
	<mat-label>{{field.templateOptions.label}}</mat-label>
	<ckeditor [editor]="Editor" [formControl]="formControl" [data]="field.templateOptions.data" [formlyAttributes]="field"></ckeditor>
	`
})

// <ckeditor [editor]="Editor" [formControl]="formControl" [data]="field.templateOptions.data" [formlyAttributes]="field"></ckeditor>
export class CkeditorFormatInput extends FieldType implements AfterViewInit {
	@ViewChild('ckeditor') ckeditor: ElementRef;
	public Editor = ClassicEditor;
	// modelData = '';
	ckconfig = {
		toolbar: {
			items: [
				'bold',
				'italic',
				'underline',
				'specialCharacters',
				'link',
				'bulletedList',
				'numberedList',
				'horizontalLine',
				'|',
				'alignment',
				'indent',
				'outdent',
				'|',
				'imageInsert',
				'blockQuote',
				'insertTable',
				'|',
				'fontSize',
				'fontColor',
				'fontFamily',
				'highlight',
				'fontBackgroundColor'
			]
		},
		image: {
			toolbar: [
				'imageTextAlternative',
				'imageStyle:full',
				'imageStyle:side',
				'linkImage'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells',
				'tableCellProperties',
				'tableProperties'
			]
		},
		language: 'id'
	};

	get type() {
		return this.to.type || 'text';
	}

	ngAfterViewInit() {
		// if (this.ckeditor) {
			// ClassicEditor.replace('ckeditor', this.ckconfig);
		// }

	}
}
