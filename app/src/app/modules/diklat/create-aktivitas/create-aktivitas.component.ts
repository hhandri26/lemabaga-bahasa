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
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DiklatService } from 'app/services/diklat.service';
import moment from 'moment';
import { environment } from 'environments/environment';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
    templateUrl: './create-aktivitas.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CreateAktivitasComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    instructuresList$: Observable<any[]> = this._referensiService.instructures();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateAktivitasComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _diklatService: DiklatService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            title: [(this._data.activity?.title) ? this._data.activity?.title : '', [Validators.required]],
            pelaksana: [(this._data.activity?.pelaksana) ? this._data.activity?.pelaksana : '', [Validators.required]],
            activityGroupDate: [this._data.section?.endDate, [Validators.required]],
            startTime: [this._data.activity?.startTime, [Validators.required]],
            endTime: [this._data.activity?.endTime, [Validators.required]],
            jp: [this._data.activity?.endTime, [Validators.required]],
            hasAttendance: [this._data.activity?.hasAttendance ?? false],
            instructureId: [this._data.activity?.instructureId]
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
            sectionId: this._data.section.id,
            title: formInput.title,
            instructureId: formInput.instructureId,
            hasAttendance: formInput.hasAttendance,
            pelaksana: formInput.pelaksana,
            startTime: (formInput.startTime).substring(0,2) + ':' + (formInput.startTime).substring(2,4),
            endTime: (formInput.endTime).substring(0,2) + ':' + (formInput.endTime).substring(2,4),
            activityGroupDate: moment(formInput.activityGroupDate).format('YYYY-MM-DD'),
            jp: +formInput.jp
        };
        if(this._data.activity?.id){
            params.id = this._data.activity.id;
        }

        if(this._data.activity?.id){
            this._diklatService.activityGroupModify(JSON.stringify(params)).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Sesi `' + formInput.title + '` berhasil diubah');
                        this.form.reset();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        } else {
            this._diklatService.activityGroupCreate(JSON.stringify(params)).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Sesi `' + formInput.title + '` berhasil ditambahkan');
                        this.form.reset();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        }
    }

    hasAttendance(ob: MatSlideToggleChange) {
        this.form.get('hasAttendance').setValue(ob.checked);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
