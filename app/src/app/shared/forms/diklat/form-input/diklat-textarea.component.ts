/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable max-len */
import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';

@Component({
	selector: 'diklat-input-textarea',
	template: `
        <div *ngIf='!editMode' class="text-md" (click)='editMode=true'>{{(data) ? data : 'N/A'}} <mat-icon class="icon-size-5" matSuffix [svgIcon]="'heroicons_solid:pencil-alt'"></mat-icon></div>
        <mat-form-field *ngIf='editMode' [ngClass]="formFieldHelpers" class="w-full">
            <textarea matInput rows="3" (focusout)="onFocusOut()" (keydown.enter)='$event.target.blur()' [(ngModel)]='data' appAutofocus [type]="type" (focusout)="editMode=false"></textarea>
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
export class DiklatTextareaComponent implements OnInit {
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
