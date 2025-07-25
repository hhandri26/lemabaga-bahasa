/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { HelperService } from 'app/services/helper.service';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, filter, finalize, map, Subject, switchMap, takeUntil, tap } from 'rxjs';

@Component({
    selector: 'app-pendidikan',
    templateUrl: './pendidikan.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class PendidikanComponent implements OnInit, OnDestroy {
    isLoading = false;
    rwPendidikan: any[] = [];
    rwUsuls: any[] = [];
    pnsId: string;
    selected: any | null = null;
    editMode: boolean = false;
    insertMode: boolean = false;
    onFileInputed: boolean = false;
    resultKabKota: any[];
    resultPendidikan: any[];
    form: FormGroup;
    tahun = this._referensiService.tahun();
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
        private _userService: UserService
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            tingkatPendidikan: [null,Validators.required],
            tahunLulus: [null, Validators.required],
            namaSekolah: [null, Validators.required],
            jurusan: [null, Validators.required],
            // durasi: [null, Validators.required],
            lokasiPendidikan: [null, [Validators.required]],
            file: [null, Validators.required]
        });

        // this.form.get('pendidikanId').valueChanges
        //     .pipe(
        //         debounceTime(300),
        //         takeUntil(this._unsubscribeAll),
        //         tap(() => this.isLoading = true),
        //         map((value) => {
        //             if (!value || value.length < 2) {
        //                 this.resultPendidikan = null;
        //             }
        //             return value;
        //         }),
        //         filter(value => value && value.length >= 2),
        //         switchMap(value => this._referensiService.pendidikan({ q: value }).pipe(
        //             finalize(() => this.isLoading = false),
        //         ))
        //     ).subscribe((items: any) => {
        //         this.resultPendidikan = items?.content;
        //         this._changeDetectorRef.markForCheck();
        //     });

        this.loadData();
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

        this._penerjemahService.getRwPendidikan(this.pnsId).subscribe();

        this._penerjemahService.rwPendidikan$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                if (item) {
                    this.rwPendidikan = item;
                    this._changeDetectorRef.markForCheck();
                }
            });

        this._penerjemahService.getHistoriUsulProfil({
            pnsId: this.pnsId,
            jenisUsul: 'RW_PENDIDIKAN',
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
            error: () => {
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
        if (formInput.tingkatPendidikan) { body.append('tingkatPendidikan', formInput.tingkatPendidikan); }
        if (formInput.tahunLulus) { body.append('tahunLulus', formInput.tahunLulus); }
        if (formInput.namaSekolah) { body.append('namaSekolah', formInput.namaSekolah); }
        if (formInput.jurusan) { body.append('jurusan', formInput.jurusan); }
        if (formInput.lokasiPendidikan) { body.append('lokasiPendidikan', formInput.lokasiPendidikan); }
        if (formInput.file) { body.append('file', formInput.file); }

        this._penerjemahService.saveRwPendidikan(body).subscribe(
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
                this._penerjemahService.deleteRwPendidikan(this.selected.id).subscribe(
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
        if (formInput.tingkatPendidikan) { body.append('tingkatPendidikan', formInput.tingkatPendidikan); }
        if (formInput.tahunLulus) { body.append('tahunLulus', formInput.tahunLulus); }
        if (formInput.namaSekolah) { body.append('namaSekolah', formInput.namaSekolah); }
        if (formInput.jurusan) { body.append('jurusan', formInput.jurusan); }
        if (formInput.lokasiPendidikan) { body.append('lokasiPendidikan', formInput.lokasiPendidikan); }
        if (formInput.file) { body.append('file', formInput.file); }

        this._penerjemahService.saveRwPendidikan(body).subscribe(
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

    displayFn(item: { propinsiNama: string; nama: string; }) {
        if (item) { return item.propinsiNama + ', ' + item.nama; }
    }

    displayPendidikanFn(item: { tkPendidikan: string; nama: string; }) {
        if (item) { return item.tkPendidikan + ', ' + item.nama; }
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

        this._penerjemahService.getRwPendidikanById(id)
            .subscribe((item) => {
                this.selected = item;
                item.pendidikanId = { id: item.pendidikanId, nama: item.pendidikanNama, tkPendidikan: item.pendidikanTkPendidikan };
                this.form.patchValue(item);
                this._changeDetectorRef.markForCheck();
            });
    }

    closeDetails(): void {
        this.selected = null;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
