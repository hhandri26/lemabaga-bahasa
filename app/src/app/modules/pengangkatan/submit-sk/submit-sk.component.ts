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
import { Subject } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { PengangkatanService } from 'app/services/pengangkatan.service';
import moment from 'moment';

@Component({
    templateUrl: './submit-sk.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class SubmitSkComponent implements OnInit, OnDestroy {
    form: FormGroup;
    onFileInputed: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<SubmitSkComponent>,
        @Inject(MAT_DIALOG_DATA) public _pengangkatanId: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _pengangkatanService: PengangkatanService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            tmtPengangkatan: ['', [Validators.required]],
            skTanggal: ['', [Validators.required]],
            skNomor: ['', [Validators.required]],
            file: ['', [Validators.required]]
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    approved(): void {
        const formInput = this.form.getRawValue();
        const body = new FormData();
        body.append('pengangkatanId', this._pengangkatanId);
        body.append('tmtPengangkatan', moment(formInput.tmtPengangkatan).format('DD-MM-YYYY'));
        body.append('skTanggal',  moment(formInput.skTanggal).format('DD-MM-YYYY'));
        body.append('skNomor', formInput.skNomor);
        if (formInput.file) { body.append('file', formInput.file); }
        this._pengangkatanService.sendSk(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Submit SK Pengangkatan Berhasil');
                    this.form.reset();
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    toggleOnFileInputed(onFileInputed: boolean | null = null): void {
        if (onFileInputed === null) {
            this.onFileInputed = !this.onFileInputed;
        } else {
            if (!onFileInputed) {
                this.form.get('file').setValue(null);
                (document.getElementById('fileDokumen') as HTMLElement).innerText = null;
            }
            this.onFileInputed = onFileInputed;
        }
        this._changeDetectorRef.markForCheck();
    }

    onFileInput(event) {
        const response = this._referensiService.onFileInputSingle(event, 'application/pdf', 2000);
        if (!response.isSuccess) {
            this._toastr.error(response.msg, 'ERROR');
            return false;
        }
        this.onFileInputed = true;
        (document.getElementById('fileDokumen') as HTMLElement).innerText = response.fileInfo.name;
        this.form.get('file').setValue(event.target.files[0]);
        return true;
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
