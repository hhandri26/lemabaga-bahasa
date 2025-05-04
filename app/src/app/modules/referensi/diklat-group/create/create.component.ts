/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { ReferensiDiklatGroupService } from 'app/services/referensi-diklat-group.service';
import { HelperService } from 'app/services/helper.service';

@Component({
    templateUrl: './create.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateComponent implements OnInit, OnDestroy {
    form: FormGroup;
    jenisKegiatanList = this._helperService.jenisKegiatanList();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        private _toastr: ToastrService,
        public _helperService: HelperService,
        private _referensiDiklatGroupService: ReferensiDiklatGroupService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            nama: ['', [Validators.required]],
            jenisKegiatan: ['', [Validators.required]],
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    create(): void {
        const params: any = this.form.getRawValue();
        this._referensiDiklatGroupService.save(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Referensi group diklat berhasil ditambahkan', 'Tambah referensi group diklat berhasil');
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
