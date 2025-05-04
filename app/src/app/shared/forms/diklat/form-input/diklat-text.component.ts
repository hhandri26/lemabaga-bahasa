/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
// <mat-form-field *ngIf='editMode' appearance="fill" style="width: 100%;" class="mat-form-field-fluid">
// 		<input matInput (focusout)="onFocusOut()" (keydown.enter)='$event.target.blur()' [(ngModel)]='data' appAutofocus [type]="type" (focusout)="editMode=false">
// 		</mat-form-field>
@Component({
    selector: 'diklat-text',
    template: `
    <div *ngIf='!editMode' class="text-md kt-link" (click)='editMode=true'>{{(data) ? data : 'N/A'}} <mat-icon class="icon-size-5 flaticon-edit" matSuffix [svgIcon]="'heroicons_solid:pencil-alt'"></mat-icon></div>
        <mat-form-field *ngIf='editMode' [ngClass]="formFieldHelpers" class="w-full">
            <input matInput (keydown.enter)='$event.target.blur()' [(ngModel)]='data' appAutofocus [type]="type" (focusout)="editMode=false">
            <button mat-flat-button (focus)="onSave()"><mat-icon class="icon-size-4 text-primary" matSuffix [svgIcon]="'heroicons_solid:check'"></mat-icon></button>
            <button mat-flat-button (focus)="onClose()"><mat-icon class="icon-size-4" matSuffix [svgIcon]="'heroicons_solid:x'"></mat-icon></button>
        </mat-form-field>
  	`,
    styles: [
        '.flaticon-edit{ visibility: hidden; }',
        '.kt-link:hover .flaticon-edit{ visibility: visible; }'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiklatTextComponent implements OnInit {
    @Input() data: any;
    @Input() type: any;
    @Output() focusOut: EventEmitter<any> = new EventEmitter<any>();
    editMode = false;

    constructor(
        private cdk: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
    }

    onSave() {
        this.focusOut.emit(this.data);
        this.editMode = false;
        this.cdk.markForCheck();
    }

    onClose() {
        this.editMode = false;
        this.cdk.markForCheck();
    }
}
