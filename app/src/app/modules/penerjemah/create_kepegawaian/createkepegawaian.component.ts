/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, filter, finalize, map, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { UserService } from 'app/services/user.service';
import { PenerjemahService } from 'app/services/penerjemah.service';
import moment from 'moment';

@Component({
    templateUrl: './createkepegawaian.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CreateComponentKepegawaian implements OnInit, OnDestroy {
    isLoading = false;
    form: FormGroup;
    jenisBahasa$: Observable<any[]> = this._referensiService.jenisBahasa();

    resultInstansi: any[];
    resultUnitKerja: any[];
    roles$: Observable<any[]> = this._referensiService.roles();
    resultTempatLahir: any[];
    jenisKelaminList = this._helperService.jenisKelaminList();
    jenisJabatan$: Observable<any[]> = this._referensiService.jabatan();
    jenisGolongan$: Observable<any[]> = this._referensiService.golongan();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateComponentKepegawaian>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _penerjemahService: PenerjemahService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            nama: new FormControl('', [Validators.required]),
            nip: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.required]),
            tempatLahirId: new FormControl('', [Validators.required, this._helperService.requireMatch]),
            tglLahir: new FormControl('', [Validators.required]),
            jenisKelamin: new FormControl('', [Validators.required]),
            noHp: new FormControl(''),
             npwp: new FormControl(''),
            kepakaran: new FormControl(''),
            nomorRekening: new FormControl(''),
            newBahasaId:new FormControl('' ),
            beforeBahasaId:new FormControl(''),
            bahasaId:new FormControl('', [ Validators.required]),
            // agama: new FormControl(''),
            // alamatDomisiliDeskripsi: new FormControl(''),
            // alamatDomisiliId: new FormControl('', [this._helperService.requireMatch]),
            // telpDomisili: new FormControl(''),
            // alamatKantorDeskripsi: new FormControl(''),
            // alamatKantorId: new FormControl('', [this._helperService.requireMatch]),
            // golonganId: new FormControl('', [Validators.required]),
            // jabatanId: new FormControl('', [Validators.required]),
            unitKerjaNama: new FormControl(''),
            instansiId: new FormControl('', [Validators.required, this._helperService.requireMatch]),
            satuanOrganisasi: new FormControl(''),
            // tmtGolongan: new FormControl('', [Validators.required]),
            // tmtJabatan: new FormControl('', [Validators.required]),
            isAktif: new FormControl('', [Validators.required]),
        });

        this.form.get('instansiId').valueChanges
        .pipe(
            debounceTime(300),
            takeUntil(this._unsubscribeAll),
            tap(() => this.isLoading = true),
            map((value) => {
                if (!value || value.length < 2) {
                    this.resultInstansi = null;
                }
                return value;
            }),
            filter(value => value && value.length >= 2),
            switchMap(value => this._referensiService.instansi({ q: value }).pipe(
                finalize(() => this.isLoading = false),
            ))
        ).subscribe((items: any) => {
            this.resultInstansi = items?.content;
            this._changeDetectorRef.markForCheck();
        });

        // this.form.get('unitKerjaId').valueChanges
        //     .pipe(
        //         debounceTime(300),
        //         takeUntil(this._unsubscribeAll),
        //         tap(() => this.isLoading = true),
        //         map((value) => {
        //             if (!value || value.length < 2) {
        //                 this.resultUnitKerja = null;
        //             }
        //             return value;
        //         }),
        //         filter(value => value && value.length >= 2),
        //         switchMap(value => this._referensiService.unitKerja({ q: value }).pipe(
        //             finalize(() => this.isLoading = false),
        //         ))
        //     ).subscribe((items: any) => {
        //         console.log(items);
        //         this.resultUnitKerja = items;
        //         this._changeDetectorRef.markForCheck();
        //     });

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

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    create(): void {
        const params: any = this.form.getRawValue();
        const formData = new FormData();

        
        formData.append('nama', params.nama);
        formData.append('nip', params.nip);
        formData.append('noHp', params.noHp);
        formData.append('npwp', params.npwp);
        formData.append('nomorRekening', params.nomorRekening);
        formData.append('kepakaran', params.kepakaran);
         formData.append('newBahasaId', params.bahasaId);
    if (params.bahasaId) { 
        formData.append('bahasaId', params.bahasaId); 
    }
        formData.append('email', params.email);
        formData.append('tempatLahirId', params.tempatLahirId.id);
        formData.append('tglLahir', moment(params.tglLahir).format('DD-MM-YYYY'));
        formData.append('jenisKelamin', params.jenisKelamin);
        // formData.append('golonganId', params.golonganId);
        // formData.append('jabatanId', params.jabatanId);
        formData.append('instansiId', params.instansiId.id);
        formData.append('unitKerjaNama', params.unitKerjaNama);
        formData.append('satuanOrganisasi', params.satuanOrganisasi);
        // formData.append('tmtJabatan', moment(params.tmtJabatan).format('DD-MM-YYYY'));
        // formData.append('tmtGolongan', moment(params.tmtGolongan).format('DD-MM-YYYY'));
        formData.append('isAktif', params.isAktif);

        this._penerjemahService.saveDataUtamaKepegawaian(formData).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Kepegawaian berhasil ditambahkan, password akan dikirimkan melalui email', 'Tambah pengguna berhasil');
                    this.form.reset();
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    displayFn(item) {
        if (item) { return item.nama; }
    }

    displayInstansiFn(item: { nama: string; jenis: string }) {
        if (item) { return item.nama; }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
