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
import { FormasiService } from 'app/services/formasi.service';
import { PengangkatanService } from 'app/services/pengangkatan.service';

@Component({
    templateUrl: './submit-usulan.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class SubmitUsulanComponent implements OnInit, OnDestroy {
    form: FormGroup;
    onFileInputed: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<SubmitUsulanComponent>,
        @Inject(MAT_DIALOG_DATA) public _item: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _pengangkatanService: PengangkatanService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            dokumenBiodata: [null, Validators.required],
            dokumenPernyataan: [null, Validators.required],
            dokumenUsulan: [null, Validators.required],
            dokumenSkPangkatTerakhir: [null, Validators.required],
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    approved(): void {
        const formInput = this.form.getRawValue();
        const body = new FormData();
        body.append('pengangkatanId', this._item.id);
        body.append('formasiDetailId', this._item.formasiDetail.id);
        if (formInput.dokumenPernyataan) { body.append('dokumenPernyataan', formInput.dokumenPernyataan); }
        if (formInput.dokumenBiodata) { body.append('dokumenBiodata', formInput.dokumenBiodata); }
        if (formInput.dokumenUsulan) { body.append('dokumenUsulan', formInput.dokumenUsulan); }
        if (formInput.dokumenSkPangkatTerakhir) { body.append('dokumenSkPangkatTerakhir', formInput.dokumenSkPangkatTerakhir); }
        this._pengangkatanService.submitUsul(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Submit pengangkatan berhasil');
                    this.form.reset();
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    toggleOnFileInputed(id, onFileInputed: boolean | null = null): void {
        if (!onFileInputed) {
            this.form.get(id).setValue(null);
            (document.getElementById(id) as HTMLElement).innerText = null;
        }
        this._changeDetectorRef.markForCheck();
    }

    onFileInput(id, event) {
        const response = this._referensiService.onFileInputSingle(event, 'application/pdf', 2000);
        if (!response.isSuccess) {
            this._toastr.error(response.msg, 'ERROR');
            return false;
        }
        (document.getElementById(id) as HTMLElement).innerText = response.fileInfo.name;
        this.form.get(id).setValue(event.target.files[0]);
        return true;
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
