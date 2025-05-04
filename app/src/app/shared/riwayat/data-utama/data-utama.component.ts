/* eslint-disable @typescript-eslint/no-shadow */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { HelperService, MY_FORMATS } from 'app/services/helper.service';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { ReferensiService } from 'app/services/referensi.service';
import { debounceTime, filter, finalize, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'app-data-utama',
    templateUrl: './data-utama.component.html',
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataUtamaComponent implements OnInit, OnDestroy {
    isLoading = false;
    role: string = this._authService.role;
    item: any;
    form: FormGroup;
    resultTempatLahir: any[];
    editMode: boolean = false;
    genders = this._helperService.jenisKelaminList();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _penerjemahService: PenerjemahService,
        private _referensiService: ReferensiService,
        private _helperService: HelperService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _toastr: ToastrService,
        private _authService: AuthService,
        private _fuseConfirmationService: FuseConfirmationService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            nama: [null, Validators.required],
            tempatLahirId: [null, [Validators.required, this._helperService.requireMatch]],
            _tglLahir: [null, Validators.required],
            noHp: [null, [Validators.required, Validators.pattern('[0-9]+')]],
            email: [null, [Validators.required, Validators.email]],
            alamatDomisiliDeskripsi: [null, Validators.required]
        });

        if (this._authService.role === 'ROLE_ADMIN') {
            this._penerjemahService.jfpItem$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((item: any) => {
                    this._penerjemahService.getDataUtama(item.id).subscribe();
                    this.fetchData();
                });
        } else {
            this.fetchData();
        }


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

    fetchData(): void {
        this._penerjemahService.dataUtama$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                console.log('Data yang diterima:', item);
                this.item = item;
                if (item?.tempatLahir) {
                    item.tempatLahirId = item.tempatLahir;
                    item._tglLahir = this._helperService.getDateFromStringID(item.tglLahir);
                    item.satuanorganisasi = item.satuanorganisasi;
                    item.unitkerja = item.unitkerja;
                }
                this.form.patchValue(item); 
                this._changeDetectorRef.markForCheck();
            });
    }

    update(): void {
        const formInput: any = this.form.getRawValue();
        const body = new FormData();
        if (formInput.nama) { body.append('nama', formInput.nama); }
        if (formInput.tempatLahirId) { body.append('tempatLahirId', formInput.tempatLahirId.id); }
        if (formInput._tglLahir) { body.append('tglLahir', moment(formInput._tglLahir).format('DD-MM-YYYY')); }
        if (formInput.noHp) { body.append('noHp', formInput.noHp); }
        if (formInput.alamatDomisiliDeskripsi) { body.append('alamatDomisiliDeskripsi', formInput.alamatDomisiliDeskripsi); }
        body.append('id', this.item.id);
        body.append('nip', this.item.nip);
        body.append('golonganId', this.item.golonganId);
        body.append('instansiId', this.item.instansiId);
        body.append('tmtGolongan', this.item.tmtGolongan);
        body.append('jenisKelamin', this.item.jenisKelamin);
        body.append('jabatanId', this.item.jabatanId);
        body.append('unitkerja', this.item.unitkerja);
        body.append('satuanorganisasi', this.item.satuanorganisasi);
        body.append('email', formInput.email);

        this._penerjemahService.updateDataUtama(body)
            .subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Data berhasil diubah', 'Update Berhasil');
                        this.form.reset();
                        this.toggleEditMode(false);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
    }

    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    toggleDeleteMode(id): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus JFP',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:x',
                'color': 'warn'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': 'Konfirm hapus',
                    'color': 'warn'
                },
                'cancel': {
                    'show': true,
                    'label': 'Batal'
                }
            },
            'dismissible': true
        });

        dialogRef.afterClosed().subscribe((_result) => {
            if (_result === 'confirmed') {
                this._penerjemahService.deleteProfil(id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('PFP telah dihapus');
                            this.fetchData();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    displayFn(item) {
        if (item) { return item.nama; }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
