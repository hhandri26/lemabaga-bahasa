/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable max-len */
import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';
export const MY_FORMATS = {
	parse: {
		dateInput: 'DD-MM-YYYY',
	},
	display: {
		dateInput: 'DD-MM-YYYY',
		monthYearLabel: 'DD-MM-YYYY',
		dateA11yLabel: 'DD-MM-YYYY',
		monthYearA11yLabel: 'DD-MM-YYYY',
	},
};

@Component({
	selector: 'diklat-date',
	template: `
        <div *ngIf='!editMode' class="text-md" (click)='editMode=true'>{{(data) ? data : 'N/A'}} <mat-icon class="icon-size-5 flaticon-edit" matSuffix [svgIcon]="'heroicons_solid:pencil-alt'"></mat-icon></div>
        <!-- <mat-form-field class="w-full">
                    <input matInput [min]="minDate" [max]="maxDate" [matDatepicker]="pickerTanggal" [(ngModel)]='data' (focus)="pickerTanggal.open()" (keydown.enter)='$event.target.blur()' [(ngModel)]='data' appAutofocus [type]="type">
                    <mat-datepicker-toggle matSuffix [for]="pickerTanggal"></mat-datepicker-toggle>
                    <mat-datepicker #pickerTanggal></mat-datepicker>
                </mat-form-field> -->
                `,
	styles: [
		'.flaticon-edit{ visibility: hidden; }',
		'.kt-link:hover .flaticon-edit{ visibility: visible; }'
	],
	providers: [
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
		{ provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiklatDateComponent implements OnInit {
	@Input() data: any;
	@Input() type: any;
	@Input() minDate: any;
	@Input() maxDate: any;
	@Output() focusOut: EventEmitter<any> = new EventEmitter<any>();

	editMode = false;
	date: any;
	constructor(
		private cdk: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		const dateParts = this.data.split('-');
		// this.date = new Date(+dateParts[2], (+dateParts[1] - 1), +dateParts[0]);
		// console.log('this.datathis.datathis.datathis.datathis.data',this.data);
		this.date = moment(new Date(+dateParts[0], (+dateParts[1] - 1), +dateParts[2])).format('DD-MM-YYYY');
	}

	onFocusOut() {
		// console.log(this.data);
		this.focusOut.emit(moment(this.data).format('YYYY-MM-DD'));
		this.editMode = false;
		this.cdk.markForCheck();
	}
}
