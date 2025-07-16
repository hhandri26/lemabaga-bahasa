/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { finalize, Subject, takeUntil } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ReferensiUnitKerjaService } from 'app/services/referensi-unit-kerja.service';

@Component({
    templateUrl: './create.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CreateComponent implements OnInit, OnDestroy {
    form: FormGroup;
    isLoading = false;
    resultInstansi: any[];
    jenisInstansiList = this._referensiService.jenisInstansiList();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _referensiUnitKerjaService: ReferensiUnitKerjaService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            instansiId: [null, [Validators.required]],
            nama: ['', [Validators.required]],
        });

        this._referensiService.instansi({ q: '', size: 1000 }).pipe(
            takeUntil(this._unsubscribeAll),
            finalize(() => this.isLoading = false)
        ).subscribe((items: any) => {
            this.resultInstansi = items;
            this._changeDetectorRef.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    create(): void {
        const params: any = this.form.getRawValue();
        params.instansiId = params.instansiId.id;
        this._referensiUnitKerjaService.save(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Referensi unit kerja berhasil ditambahkan', 'Tambah referensi unit kerja berhasil');
                    this.form.reset();
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }



    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
