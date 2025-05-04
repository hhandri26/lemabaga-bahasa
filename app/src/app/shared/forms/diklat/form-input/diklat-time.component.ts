/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable max-len */
import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import moment from 'moment';

@Component({
	selector: 'diklat-time',
	template: `
		<div *ngIf='!editMode' (click)='editMode=true' class="kt-link kt-link--state kt-link--dark">{{(data) ? data : 'N/A'}}</div>
		<mat-form-field *ngIf='editMode' appearance="fill" class="mat-form-field-fluid">
		<input matInput (focusout)="onFocusOut()" mask="Hh:m0" [leadZeroDateTime]="true" (keydown.enter)='$event.target.blur()' [(ngModel)]='data' appAutofocus [type]="type" (keydown.enter)='$event.target.blur()' (focusout)="editMode=false">
		</mat-form-field>
  	`,
	styles: [
		'.flaticon-edit{ visibility: hidden; }',
		'.kt-link:hover .flaticon-edit{ visibility: visible; }'
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiklatTimeComponent implements OnInit {
	@Input() data: any;
	@Input() type: any;
	@Output() focusOut: EventEmitter<any> = new EventEmitter<any>();
	editMode = false;

	constructor(
		private cdk: ChangeDetectorRef
	) { }

	ngOnInit(): void {
	}

	onFocusOut() {
		this.focusOut.emit(moment.utc(this.data, 'HH:mm').format('HH:mm'));
		this.cdk.markForCheck();
	}
}
