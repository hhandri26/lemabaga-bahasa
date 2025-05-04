/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
	selector: 'formly-field-time-input',
	template: `
	<mat-form-field appearance="fill" class="mat-form-field-fluid">
    <mat-label>{{field.templateOptions.label}}</mat-label>
    <input matInput mask="Hh:m0" type="text" [leadZeroDateTime]="true"  [formControl]="formControl" [formlyAttributes]="field">
   </mat-form-field>`
})
export class TimeFormatInput extends FieldType {
	get type() {
		return this.to.type || 'text';
	}
}
