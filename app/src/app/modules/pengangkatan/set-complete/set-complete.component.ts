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

@Component({
    templateUrl: './set-complete.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class SetCompleteComponent implements OnInit, OnDestroy {
    form: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<SetCompleteComponent>,
        @Inject(MAT_DIALOG_DATA) public _item: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _toastr: ToastrService,
        private _pengangkatanService: PengangkatanService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            notes: ['', [Validators.required]]
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    send(): void {
        const formInput = this.form.getRawValue();
        const body = new FormData();
        body.append('pengangkatanId', this._item.id);
        body.append('notes', formInput.notes);
        this._pengangkatanService.setComplete(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Finalisasi pengangkatan berhasil dan akun PFP telah dibuat');
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
