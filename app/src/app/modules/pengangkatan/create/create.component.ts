/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, ChangeDetectorRef, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, filter, finalize, map, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { KegiatanService } from 'app/services/kegiatan.service';
import moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { PengangkatanService } from 'app/services/pengangkatan.service';

@Component({
    templateUrl: './create.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CreateComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    isLoading = false;
    form: FormGroup;
    types: any[];
    file = null;
    jenisPengangkatanList = this._helperService.jenisPengangkatanList();
    resultTempatLahir: any[];
    baseUrl = environment.baseUrl;

    jenisJabatan$: Observable<any[]> = this._referensiService.jabatan();
    provinsi$: Observable<any[]> = this._referensiService.provinsi({ q: '' });
    bahasaList: Observable<any> = this._referensiService.jenisBahasa();
    jenisGolongan$: Observable<any[]> = this._referensiService.golongan();
    genders = this._helperService.jenisKelaminList();

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateComponent>,
        @Inject(MAT_DIALOG_DATA) public _formasiDetailId: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _pengangkatanService: PengangkatanService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            formasiDetailId: [this._formasiDetailId],
            tipePengangkatan: [null, [Validators.required]],
            nama: [null, Validators.required],
            nip: [null, Validators.required],
            email: [null, Validators.required],
            tempatLahirId: [null, [Validators.required, this._helperService.requireMatch]],
            tglLahir: [null, Validators.required],
            jenisKelamin: [null, Validators.required],
            tmtGolongan: [null, [Validators.required]],
            golonganId: ['', [Validators.required]],
            // tmtJabatan: [null, [Validators.required]],
            alamatKantorDeskripsi: [null, [Validators.required]],
            telpKantor: [null, [Validators.required]],

            dokumenBiodata: [null, Validators.required],
            dokumenPernyataan: [null, Validators.required],

            // pengangkatanId: [this._pengangkatanId],
        });

        this.form.get('tempatLahirId').valueChanges
        .pipe(
            debounceTime(300),
            takeUntil(this._unsubscribeAll),
            tap(() => this.isLoading = true),
            map((value) => {
                if (!value || value.length < 2) {
                    this.resultTempatLahir = null;
                }
                return value;
            }),
            filter(value => value && value.length >= 2),
            switchMap(value => this._referensiService.kabupaten({ q: value }).pipe(
                finalize(() => this.isLoading = false),
            ))
        ).subscribe((items: any) => {
            this.resultTempatLahir = items;
            this._changeDetectorRef.markForCheck();
        });
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    create(isDraft): void {
        const formInput = this.form.getRawValue();
        console.log('formInput', formInput);
        const pnsBiodata = {
            nama: formInput.nama,
            nip: formInput.nip,
            golonganId: formInput.golonganId,
            email: formInput.email,
            tmtGolongan: moment(formInput.tmtGolongan).format('DD-MM-YYYY'),
            // tmtJabatan: moment(formInput.tmtJabatan).format('DD-MM-YYYY'),
            alamatKantorId: null,
            alamatKantorDeskripsi: formInput.alamatKantorDeskripsi,
            telpKantor: formInput.telpKantor,
            tempatLahirId: formInput.tempatLahirId.id,
            tglLahir: moment(formInput.tglLahir).format('DD-MM-YYYY'),
            jenisKelamin: formInput.jenisKelamin
        };
        const body = new FormData();
        body.append('formasiDetailId', formInput.formasiDetailId);
        body.append('pnsBiodata', JSON.stringify(pnsBiodata));
        body.append('tipePengangkatan', formInput.tipePengangkatan);
        // body.append('pengangkatanId', '');
        if (formInput.dokumenPernyataan) { body.append('dokumenPernyataan', formInput.dokumenPernyataan); }
        if (formInput.dokumenBiodata) { body.append('dokumenBiodata', formInput.dokumenBiodata); }

        this._pengangkatanService.saveUsul(isDraft, body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Berkas pengangkatan berhasil ' + (isDraft ? 'disimpan' : 'disubmit, mohon tunggu proses verifikasi oleh Pembina'));
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

    displayFn(item) {
        if (item) { return item.nama; }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
