/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DiklatService } from 'app/services/diklat.service';

@Component({
    templateUrl: './create-aktivitas-url.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CreateAktivitasUrlComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateAktivitasUrlComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _toastr: ToastrService,
        private _diklatService: DiklatService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            id: [this._data?._id ?? null],
            activityGroupId: [this._data?.id, [Validators.required]],
            description: [this._data?.description, [Validators.required]],
            link: [this._data?.link, [Validators.required]]
        });
    }

    ngAfterViewInit() {
        (<any>Object).values(this.form.controls).forEach((control) => {
            control.markAsTouched();
        });
        this._changeDetectorRef.detectChanges();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    create(): void {
        const formInput: any = this.form.getRawValue();
        const params: any = {
            id: formInput.id,
            activityGroupId: formInput.activityGroupId,
            description: formInput.description,
            link: formInput.link
        };

        if(this._data?.id){
            this._diklatService.activityURL(JSON.stringify(params)).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Berbagi Url `' + formInput.description + '` berhasil diubah');
                        this.form.reset();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        } else {
            this._diklatService.activityURL(JSON.stringify(params)).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Berbagi Url `' + formInput.description + '` berhasil ditambahkan');
                        this.form.reset();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
