/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ReferensiInstansiService } from 'app/services/referensi-instansi.service';

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
    jenisInstansiList = this._referensiService.jenisInstansiList();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _referensiInstansiService: ReferensiInstansiService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            jenis: ['', [Validators.required]],
            nama: ['', [Validators.required]],
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    create(): void {
        const params: any = this.form.getRawValue();
        this._referensiInstansiService.save(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Referensi instansi berhasil ditambahkan', 'Tambah referensi instansi berhasil');
                    this.form.reset();
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    displayInstansiFn(item: { nama: string; jenis: string }) {
        if (item) { return item.nama; }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
