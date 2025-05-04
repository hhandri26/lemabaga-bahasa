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
    selector: 'diklat-date-range',
    template: `
        <div *ngIf='!editMode' class="text-md kt-link" (click)='editMode=true'>{{(_start) ? _start : 'N/A'}} - {{(_end) ? _end : 'N/A'}} <mat-icon class="icon-size-5 flaticon-edit" matSuffix [svgIcon]="'heroicons_solid:pencil-alt'"></mat-icon></div>
        <mat-form-field class="fuse-mat-no-subscript w-full" *ngIf='editMode'>
            <mat-date-range-input [rangePicker]="_tglMulaiAkhir" [min]="minDate" [max]="maxDate">
                <input matStartDate [(ngModel)]='start' placeholder="Mulai"  (focus)="_tglMulaiAkhir.open()">
                <input matEndDate [(ngModel)]='end' placeholder="Akhir"  (focus)="_tglMulaiAkhir.open()">
            </mat-date-range-input>
        <!-- <mat-datepicker-toggle matSuffix [for]="_tglMulaiAkhir"></mat-datepicker-toggle> -->
            <mat-date-range-picker #_tglMulaiAkhir></mat-date-range-picker>
            <button mat-flat-button (focus)="onSave()"><mat-icon class="icon-size-4 text-primary" matSuffix [svgIcon]="'heroicons_solid:check'"></mat-icon></button>
            <button mat-flat-button (focus)="onClose()"><mat-icon class="icon-size-4" matSuffix [svgIcon]="'heroicons_solid:x'"></mat-icon></button>
        </mat-form-field>`,
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
export class DiklatDateRangeComponent implements OnInit {
    @Input() start: any;
    @Input() end: any;
    @Input() type: any;
    @Input() minDate: any;
    @Input() maxDate: any;
    @Output() focusOut: EventEmitter<any> = new EventEmitter<any>();

    editMode = false;
    date: any;
    _start: any;
    _end: any;
    constructor(
        private cdk: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this._start = moment(this.start).format('DD-MM-YYYY');
        this._end = moment(this.end).format('DD-MM-YYYY');
    }

    onSave() {
        this._start = moment(this.start).format('DD-MM-YYYY');
        this._end = moment(this.end).format('DD-MM-YYYY');
        this.focusOut.emit({ startDate: moment(this.start).format('YYYY-MM-DD'), endDate: moment(this.end).format('YYYY-MM-DD') });
        this.editMode = false;
        this.cdk.markForCheck();
    }

    onClose() {
        this.editMode = false;
        this.cdk.markForCheck();
    }
}
