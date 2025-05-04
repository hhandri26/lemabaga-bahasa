/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS } from 'app/services/referensi.service';
import { Subject } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfilService } from 'app/services/profil.service';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import FileSaver from 'file-saver';

@Component({
    templateUrl: './cetak-kak.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./cetak-kak.component.scss'],
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CetakKakComponent implements OnInit, OnDestroy {
    form: FormGroup;
    items: [] = [];
    kak: any;
	kakError: any;
    blankoList = this._helperService.blankoList();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CetakKakComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: FormBuilder,
        public _helperService: HelperService,
        private _profilService: ProfilService,
        private _toastr: ToastrService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            spesimenJabatan: [''],
            spesimenNama: [''],
            spesimenNip: [''],
            noKarpeg: [''],
            tembusan1: [''],
            tembusan2: [''],
            tembusan3: [''],
            tembusan4: [''],
            tembusan5: [''],
            tembusan6: [''],
            tglPak: ['', [Validators.required]],
            isBlanko: ['', [Validators.required]],
        });
        console.log(this._data);
        this._profilService.getKAK(this._data.id).subscribe((res) => {
			if (res.success) {
				this.kak = res.mapData.data;
				this.kak.tahun_lalu = res.mapData.data.tahun - 1;
				this.kak.klasifikasiNilaiSkp.persentase = this.kak.klasifikasiNilaiSkp.persentase * 100;
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
		let queryParams: any;
		// eslint-disable-next-line prefer-const
		queryParams = {
			// 'noPak': controls['noPak'].value,
			// 'noKak': controls['noKak'].value,
			'spesimenJabatan': params.spesimenJabatan,
			'spesimenNama': params.spesimenNama,
			'spesimenNip': params.spesimenNip,
			'noKarpeg': params.noKarpeg,
			'tglPak': moment(params.tglPak).format('DD-MM-YYYY'),
			'usulId': this._data.id,
			'isBlanko': params.isBlanko,
		};

		const tembusans = [];
		if (params.tembusan1) { tembusans.push(params.tembusan1);}
		if (params.tembusan2) { tembusans.push(params.tembusan2);}
		if (params.tembusan3) { tembusans.push(params.tembusan3);}
		if (params.tembusan4) { tembusans.push(params.tembusan4);}
		queryParams.tembusan = tembusans;

        this._profilService.cetakKAK(queryParams).subscribe((blob: any) => {
            FileSaver.saveAs(blob, this.kak.pns.nip + '_' + 'KAK_' + this.kak.pns.nip + '_.pdf');
        });
    }
}
