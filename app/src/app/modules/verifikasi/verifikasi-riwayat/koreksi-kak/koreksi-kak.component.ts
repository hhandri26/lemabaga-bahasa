/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { Subject } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfilService } from 'app/services/profil.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    templateUrl: './koreksi-kak.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./koreksi-kak.component.scss'],
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class KoreksiKakComponent implements OnInit, OnDestroy {
    form: FormGroup;
    items: [] = [];
    kak: any;
	kakError: any;
    tahun = this._referensiService.tahun();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<KoreksiKakComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: FormBuilder,
        private _referensiService: ReferensiService,
        public _helperService: HelperService,
        private _profilService: ProfilService,
        private _toastr: ToastrService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            tahun: ['', [Validators.required]],
            nilaiSkp: ['', [Validators.required]],
            narasi: ['', [Validators.required]],
        });
        this._profilService.getKAK(this._data.id).subscribe((res) => {
			if (res.success) {
				this.kak = res.mapData.data;
				this.kak.tahun_lalu = res.mapData.data.tahun - 1;
				this.kak.klasifikasiNilaiSkp.persentase = this.kak.klasifikasiNilaiSkp.persentase * 100;
				console.log('this.kak.narasi', this.kak.narasi);
				this.form.get('narasi').setValue(this.kak.narasi, {onlySelf: true});
			} else {
				this.kakError = res.message;
			}
            this._changeDetectorRef.markForCheck();
		});
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    submit(): void {
        const params: any = this.form.getRawValue();

        this._profilService.correctingKAK({
			'id': this._data.id,
			'nilaiSkp': +params.nilaiSkp.toString().replace(/[^0-9.]/g, ''),
			'tahun': +params.tahun,
			'narasi': params.narasi
		}).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success(result.message);
                    this.form.reset();
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }
}
