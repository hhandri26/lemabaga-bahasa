/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { HelperService } from 'app/services/helper.service';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, filter, finalize, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Component({
    selector: 'app-mutasi',
    templateUrl: './mutasi.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class MutasiComponent implements OnInit, OnDestroy {
    isLoading = false;
    resultUnitKerja: any[] = [];
    resultSatuanOrganisasi: any[] = [];
    isLoadingUnitKerja = false;
    isLoadingSatuanOrganisasi = false;

    resultInstansi: any[] = [];
    rwInstansi: any[] = [];
    rwUsuls: any[] = [];
    pnsId: string;
    selected: any | null = null;
    editMode: boolean = false;
    insertMode: boolean = false;
    onFileInputed: boolean = false;
    form: FormGroup;
    jenisinstansi$: Observable<any[]> = this._referensiService.instansi();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _penerjemahService: PenerjemahService,
        private _referensiService: ReferensiService,
        private _helperService: HelperService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _toastr: ToastrService,
        private _authService: AuthService,
        private _userService: UserService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            instansiId: [null, Validators.required],
            unitkerja: [null, Validators.required],
            satuanorganisasi: [null, Validators.required],
            noSk: [null, Validators.required],
            file: [null, Validators.required]
        });

        this.loadData();

        this.form.get('instansiId').valueChanges
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(300),
            tap(() => {
                this.isLoading = true;
                this._changeDetectorRef.markForCheck();
            }),
            map((value) => {
                if (!value || typeof value === 'object' || value.length < 2) {
                    this.resultInstansi = [];
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                    return null;
                }
                return value;
            }),
            filter(value => value !== null),
            switchMap(value => this._referensiService.instansi({ q: value, size: 10 }).pipe(
                tap(() => {
                    if (this.form.get('instansiId').value !== value) {
                        this.resultInstansi = [];
                    }
                }),
                finalize(() => {
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                })
            ))
        ).subscribe({
            next: (items: any) => {
                this.resultInstansi = items || [];
                this._changeDetectorRef.markForCheck();
            },
            error: (error) => {
                console.error('Error fetching instansi:', error);
                this.resultInstansi = [];
                this.isLoading = false;
                this._changeDetectorRef.markForCheck();
            }
        });

        this.form.get('unitkerja').valueChanges
        .pipe(
            debounceTime(300),
            takeUntil(this._unsubscribeAll),
            tap(() => this.isLoadingUnitKerja = true),
            map((value) => {
                if (!value || value.length < 2) {
                    this.resultUnitKerja = [];
                }
                return value;
            }),
            filter(value => value && value.length >= 2),
            switchMap(value => this._referensiService.unitKerja({ q: value }).pipe(
                finalize(() => this.isLoadingUnitKerja = false),
            ))
        ).subscribe({
            next: (items: any) => {
                this.resultUnitKerja = items?.content;
                this._changeDetectorRef.markForCheck();
            },
            error: () => {
                this.isLoadingUnitKerja = false;
                this._changeDetectorRef.markForCheck();
            }
        });

        this.form.get('satuanorganisasi').valueChanges
        .pipe(
            debounceTime(300),
            takeUntil(this._unsubscribeAll),
            tap(() => this.isLoadingSatuanOrganisasi = true),
            map((value) => {
                if (!value || value.length < 2) {
                    this.resultSatuanOrganisasi = [];
                }
                return value;
            }),
            filter(value => value && value.length >= 2),
            switchMap(value => this._referensiService.satuanOrganisasi({ q: value }).pipe(
                finalize(() => this.isLoadingSatuanOrganisasi = false),
            ))
        ).subscribe({
            next: (items: any) => {
                this.resultSatuanOrganisasi = items?.filter(item => item.nama) || [];
                this._changeDetectorRef.markForCheck();
            },
            error: () => {
                this.isLoadingSatuanOrganisasi = false;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    loadData() {
        if (this._authService.role === 'ROLE_ADMIN') {
            this._penerjemahService.jfpItem$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((item: any) => {
                    this.pnsId = item.id;
                    this._changeDetectorRef.markForCheck();
                });
        } else {
            this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: any) => {
                this.pnsId = user.pnsId;
                this._changeDetectorRef.markForCheck();
            });
        }

        this._penerjemahService.getRwInstansi(this.pnsId).subscribe();

        this._penerjemahService.rwInstansi$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                console.log('Data RW Instansi:', item);
                if (item) {
                    this.rwInstansi = item;
                    this._changeDetectorRef.markForCheck();
                }
            });

        this._penerjemahService.getHistoriUsulProfil({
            pnsId: this.pnsId,
            jenisUsul: 'RW_INSTANSI',
            size: 100
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe((items: any) => {
            if (items) {
                this.rwUsuls = items;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    togglePrint(id) {
        this._penerjemahService.getDokumen(id).subscribe({
            next: (result) => {
                const fileURL = URL.createObjectURL(result);
                window.open(fileURL, '_blank');
            },
            error: (error) => {
                this._toastr.error('ERROR: Dokumen gagal ditampilkan', 'ERROR');
            }
        });
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

    insert(): void {
        const formInput: any = this.form.getRawValue();
        const body = new FormData();
        body.append('pnsId', this.pnsId);
        if (formInput.instansiId) { body.append('instansiId', formInput.instansiId.id); }
        if (formInput.unitkerja) { body.append('unitkerja', formInput.unitkerja); }
        if (formInput.satuanorganisasi) { body.append('satuanorganisasi', formInput.satuanorganisasi); }
        if (formInput.noSk) { body.append('noSk', formInput.noSk); }
        if (formInput.file) { body.append('file', formInput.file); }
        console.log('Insert Data:', { pnsId: this.pnsId, formInput, body });
        this._penerjemahService.saveRwInstansi(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Selanjutnya usulan Anda akan diverifikasi oleh Admin', 'Usulan Tambah Berhasil');
                    this.form.reset();
                    this.loadData();
                    this.toggleInsertMode(false);
                    this.toggleEditMode(false);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    delete(): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus Data',
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
                this._penerjemahService.deleteRwInstansi(this.selected.id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Selanjutnya usulan Anda akan diproses oleh Admin', 'Usulan Hapus Berhasil');
                            this.loadData();
                            this.toggleInsertMode(false);
                            this.toggleEditMode(false);
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    update(): void {
        const formInput: any = this.form.getRawValue();
        const body = new FormData();
        body.append('pnsId', this.pnsId);
        body.append('id', this.selected.id);
        if (formInput.instansiId) { body.append('instansiId', formInput.instansiId); }
        if (formInput.unitkerja) { body.append('unitkerja', formInput.unitkerja); }
        if (formInput.satuanorganisasi) { body.append('satuanorganisasi', formInput.satuanorganisasi); }
        if (formInput.noSk) { body.append('noSk', formInput.noSk); }
        if (formInput.file) { body.append('file', formInput.file); }

        this._penerjemahService.saveRwInstansi(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Selanjutnya usulan Anda akan diverifikasi oleh Admin', 'Usulan Perubahan Berhasil');
                    this.form.reset();
                    this.loadData();
                    this.toggleInsertMode(false);
                    this.toggleEditMode(false);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    displayFn(item) {
        if (item) { return item.nama; }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
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

    toggleInsertMode(insertMode: boolean | null = null): void {
        if (insertMode === null) {
            this.insertMode = !this.insertMode;
        } else {
            this.insertMode = insertMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        } else {
            this.editMode = editMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    toggleDetails(id: string): void {
        if (this.selected && this.selected.id === id) {
            this.closeDetails();
            return;
        }

        this._penerjemahService.getRwInstansiById(id)
            .subscribe((item) => {
                console.log('Fetched Item:', item); 
                this.selected = item;
                this.form.patchValue(item);
                this._changeDetectorRef.markForCheck();
            });
    }

    closeDetails(): void {
        this.selected = null;
    }
    displayInstansiFn(item: { nama: string; jenis: string }) {
        if (item) { return item.nama; }
    }

    displayUnitKerjaFn(item: any) {
        if (item) { return item.nama; }
    }

    displaySatuanOrganisasiFn(item: any) {
        if (item) { return item.nama; }
    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
