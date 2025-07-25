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
import { Subject, takeUntil } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Component({
    selector: 'app-angka-kredit',
    templateUrl: './angka-kredit.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class AngkaKreditComponent implements OnInit, OnDestroy {
    rwAngkaKreditKonversi: any[] = [];
    rwAngkaKreditAkumulasi: any[] = [];
    rwAngkaKreditPenetapan: any[] = [];
    rwAngkaKredit: any[] = [];

    rwUsuls: any[] = [];
    rwUsulAAK: any[] = [];
    rwUsulPAK: any[] = [];
    pnsId: string;
    selected: any | null = null;
    editMode: boolean = false;
    editAHK: boolean = false;
    editAAK: boolean = false;
    editPAK: boolean = false;

    insertAHK: boolean = false;
    insertAAK: boolean = false;
    insertPAK: boolean = false;
    onFileInputed: boolean = false;
    onFileInputed2: boolean = false;
    onFileInputed3: boolean = false;
    form: FormGroup;
    formAHK: FormGroup;
    formAAK: FormGroup;
    formPAK: FormGroup;
    jenisGolongan$: Observable<any[]> = this._referensiService.golongan();
    jenisJabatan$: Observable<any[]> = this._referensiService.jabatan();
    rwGolongan: any[] = [];
    rwJabatan: any[] = [];
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
        this.formAHK = this._formBuilder.group({
            nilaiAkKonversi: [null, Validators.required],
            tahun: [null, Validators.required],
            file: [null, Validators.required]
        });

        this.formAAK = this._formBuilder.group({
            nilaiAkAkumulasi: [null, Validators.required],
            tahun: [null, Validators.required],
            file: [null, Validators.required],
        });

        this.formPAK = this._formBuilder.group({
            nilaiAkPenetapan: [null, Validators.required],
            tahun: [null, Validators.required],
            file: [null, Validators.required],
        });

        this.form = this._formBuilder.group({
            golonganId: [null, Validators.required],
            jabatanId: [null, Validators.required],
            nilaiAk: [null, Validators.required],
            nilaiSkp: [null, [Validators.required, Validators.max(100)]],
            noSk: [null, Validators.required],
            tglSk: [null, Validators.required],
            tahun: [null, Validators.required],
            file: [null, Validators.required]
        });

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

        this._penerjemahService.getRwAngkaKreditKonversi(this.pnsId).subscribe();

        this._penerjemahService.rwAngkaKreditKonversi$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                if (item) {
                    this.rwAngkaKreditKonversi = item;
                    this._changeDetectorRef.markForCheck();
                }
            });
        
         this._penerjemahService.getRwAngkaKreditAkumulasi(this.pnsId).subscribe();

        this._penerjemahService.rwAngkaKreditAkumulasi$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                if (item) {
                    console.log(item);
                    this.rwAngkaKreditAkumulasi = item;
                    this._changeDetectorRef.markForCheck();
                }
            });
        
        this._penerjemahService.getRwAngkaKreditPenetapan(this.pnsId).subscribe();

        this._penerjemahService.rwAngkaKreditPenetapan$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                if (item) {
                    this.rwAngkaKreditPenetapan = item;
                    this._changeDetectorRef.markForCheck();
                }
            });

        this._penerjemahService.getRwAngkaKredit(this.pnsId).subscribe();

        this._penerjemahService.rwAngkaKredit$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                if (item) {
                    this.rwAngkaKredit = item;
                    this._changeDetectorRef.markForCheck();
                }
            });

        this._penerjemahService.getHistoriUsulProfil({
            pnsId: this.pnsId,
            jenisUsul: 'RW_ANGKA_KREDIT_KONVERSI',
            size: 100
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe((items: any) => {
            if (items) {
                this.rwUsuls = items;
                this._changeDetectorRef.markForCheck();
            }
        });

        this._penerjemahService.getHistoriUsulProfil({
            pnsId: this.pnsId,
             jenisUsul: 'RW_ANGKA_KREDIT_AKUMULASI',
            size: 100
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe((items: any) => {
            if (items) {
                this.rwUsulAAK = items;
                this._changeDetectorRef.markForCheck();
            }
        });

        this._penerjemahService.getHistoriUsulProfil({
            pnsId: this.pnsId,
             jenisUsul: 'RW_ANGKA_KREDIT_PENETAPAN',
            size: 100
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe((items: any) => {
            if (items) {
                this.rwUsulPAK = items;
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

    _insertAHK(): void {
        const formInput: any = this.formAHK.getRawValue();
        const body = new FormData();
        body.append('pnsId', this.pnsId);
        if (formInput.tahun) { body.append('tahun', formInput.tahun); }
        if (formInput.nilaiAkKonversi) { body.append('nilaiAkKonversi', formInput.nilaiAkKonversi); }
        if (formInput.file) { body.append('file', formInput.file); }

        this._penerjemahService.saveRwAngkaKreditKonversi(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Selanjutnya usulan Anda akan diverifikasi oleh Admin', 'Usulan Tambah Berhasil');
                    this.formAHK.reset();
                    this.loadData();
                    this.toggleInsertAHK(false);
                    this.toggleEditAHK(false);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    _insertAAK(): void {
        const formInput: any = this.formAAK.getRawValue();
        const body = new FormData();
        body.append('pnsId', this.pnsId);
        if (formInput.tahun) { body.append('tahun', formInput.tahun); }
        if (formInput.nilaiAkAkumulasi) { body.append('nilaiAkAkumulasi', formInput.nilaiAkAkumulasi); }
        if (formInput.file) { body.append('file', formInput.file); }

        this._penerjemahService.saveRwAngkaKreditAkumulasi(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Selanjutnya usulan Anda akan diverifikasi oleh Admin', 'Usulan Tambah Berhasil');
                    this.formAAK.reset();
                    this.loadData();
                    this.toggleInsertAAK(false);
                    this.toggleEditAAK(false);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    _insertPAK(): void {
        const formInput: any = this.formPAK.getRawValue();
        const body = new FormData();
        body.append('pnsId', this.pnsId);
        if (formInput.tahun) { body.append('tahun', formInput.tahun); }
        if (formInput.nilaiAkPenetapan) { body.append('nilaiAkPenetapan', formInput.nilaiAkPenetapan); }
        if (formInput.file) { body.append('file', formInput.file); }

        this._penerjemahService.saveRwAngkaKreditPenetapan(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Selanjutnya usulan Anda akan diverifikasi oleh Admin', 'Usulan Tambah Berhasil');
                    this.formPAK.reset();
                    this.loadData();
                    this.toggleInsertPAK(false);
                    this.toggleEditPAK(false);
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
                this._penerjemahService.deleteRwAngkaKreditKonversi(this.selected.id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Selanjutnya usulan Anda akan diproses oleh Admin', 'Usulan Hapus Berhasil');
                            this.loadData();
                            this.toggleInsertAHK(false);
                            this.toggleEditAHK(false);
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    deleteAAK(): void {
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
                this._penerjemahService.deleteRwAngkaKreditAkumulasi(this.selected.id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Selanjutnya usulan Anda akan diproses oleh Admin', 'Usulan Hapus Berhasil');
                            this.loadData();
                            this.toggleInsertAAK(false);
                            this.toggleEditAAK(false);
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    deletePAK(): void {
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
                this._penerjemahService.deleteRwAngkaKreditPenetapan(this.selected.id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Selanjutnya usulan Anda akan diproses oleh Admin', 'Usulan Hapus Berhasil');
                            this.loadData();
                            this.toggleInsertPAK(false);
                            this.toggleEditPAK(false);
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    updateAHK(): void {
        const formInput: any = this.formAHK.getRawValue();
        const body = new FormData();
        body.append('pnsId', this.pnsId);
        body.append('id', this.selected.id);
        if (formInput.tahun) { body.append('tahun', formInput.tahun); }
        if (formInput.nilaiAkKonversi) { body.append('nilaiAkKonversi', formInput.nilaiAkKonversi); }
        if (formInput.file) { body.append('file', formInput.file); }

        this._penerjemahService.saveRwAngkaKreditKonversi(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Selanjutnya usulan Anda akan diverifikasi oleh Admin', 'Usulan Perubahan Berhasil');
                    this.formAHK.reset();
                    this.loadData();
                    this.toggleInsertAHK(false);
                    this.toggleEditAHK(false);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

     updateAAK(): void {
        const formInput: any = this.formAAK.getRawValue();
        const body = new FormData();
        body.append('pnsId', this.pnsId);
        body.append('id', this.selected.id);
        if (formInput.tahun) { body.append('tahun', formInput.tahun); }
        if (formInput.nilaiAkAkumulasi) { body.append('nilaiAkAkumulasi', formInput.nilaiAkAkumulasi); }
        if (formInput.file) { body.append('file', formInput.file); }

        this._penerjemahService.saveRwAngkaKreditAkumulasi(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Selanjutnya usulan Anda akan diverifikasi oleh Admin', 'Usulan Perubahan Berhasil');
                    this.formAAK.reset();
                    this.loadData();
                    this.toggleInsertAAK(false);
                    this.toggleEditAAK(false);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
     }
     updatePAK(): void {
        const formInput: any = this.formPAK.getRawValue();
        const body = new FormData();
        body.append('pnsId', this.pnsId);
        body.append('id', this.selected.id);
        if (formInput.tahun) { body.append('tahun', formInput.tahun); }
        if (formInput.nilaiAkPenetapan) { body.append('nilaiAkPenetapan', formInput.nilaiAkPenetapan); }
        if (formInput.file) { body.append('file', formInput.file); }

        this._penerjemahService.saveRwAngkaKreditPenetapan(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Selanjutnya usulan Anda akan diverifikasi oleh Admin', 'Usulan Perubahan Berhasil');
                    this.formPAK.reset();
                    this.loadData();
                    this.toggleInsertPAK(false);
                    this.toggleEditPAK(false);
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

    onFileInput(event, id, form) {
        const response = this._referensiService.onFileInputSingle(event, 'application/pdf', 2000);
        if (!response.isSuccess) {
            this._toastr.error(response.msg, 'ERROR');
            return false;
        }
        this.onFileInputed = true;
        (document.getElementById(id) as HTMLElement).innerText = response.fileInfo.name;
        console.log(form);
        this.formAHK.get(form).setValue(event.target.files[0]);
        return true;
    }

    toggleOnFileInputed(onFileInputed: boolean | null = null, id: string, form: any): void {
        if (onFileInputed === null) {
            this.onFileInputed = !this.onFileInputed;
        } else {
            if (!onFileInputed) {
                this.formAHK.get(form).setValue(null);
                (document.getElementById(id) as HTMLElement).innerText = null;
            }
            this.onFileInputed = onFileInputed;
        }
        this._changeDetectorRef.markForCheck();
    }

    onFileInput2(event, id, form) {
        const response = this._referensiService.onFileInputSingle(event, 'application/pdf', 2000);
        if (!response.isSuccess) {
            this._toastr.error(response.msg, 'ERROR');
            return false;
        }
        this.onFileInputed2 = true;
        (document.getElementById(id) as HTMLElement).innerText = response.fileInfo.name;
        console.log(form);
        this.formAAK.get(form).setValue(event.target.files[0]);
        return true;
    }

    toggleOnFileInputed2(onFileInputed2: boolean | null = null, id: string, form: any): void {
        if (onFileInputed2 === null) {
            this.onFileInputed2 = !this.onFileInputed2;
        } else {
            if (!onFileInputed2) {
                this.formAAK.get(form).setValue(null);
                (document.getElementById(id) as HTMLElement).innerText = null;
            }
            this.onFileInputed2 = onFileInputed2;
        }
        this._changeDetectorRef.markForCheck();
    }

    onFileInput3(event, id, form) {
        const response = this._referensiService.onFileInputSingle(event, 'application/pdf', 2000);
        if (!response.isSuccess) {
            this._toastr.error(response.msg, 'ERROR');
            return false;
        }
        this.onFileInputed3 = true;
        (document.getElementById(id) as HTMLElement).innerText = response.fileInfo.name;
        console.log(form);
        this.formPAK.get(form).setValue(event.target.files[0]);
        return true;
    }

    toggleOnFileInputed3(onFileInputed3: boolean | null = null, id: string, form: any): void {
        if (onFileInputed3 === null) {
            this.onFileInputed3 = !this.onFileInputed3;
        } else {
            if (!onFileInputed3) {
                this.formPAK.get(form).setValue(null);
                (document.getElementById(id) as HTMLElement).innerText = null;
            }
            this.onFileInputed3 = onFileInputed3;
        }
        this._changeDetectorRef.markForCheck();
    }

    toggleInsertAHK(insertAHK: boolean | null = null): void {
        if (insertAHK === null) {
            this.insertAHK = !this.insertAHK;
        } else {
            this.insertAHK = insertAHK;
        }
        this._changeDetectorRef.markForCheck();
    }

    toggleInsertPAK(insertPAK: boolean | null = null): void {
        if (insertPAK === null) {
            this.insertPAK = !this.insertPAK;
        } else {
            this.insertPAK = insertPAK;
        }
        this._changeDetectorRef.markForCheck();
    }

     toggleInsertAAK(insertAAK: boolean | null = null): void {
        if (insertAAK === null) {
            this.insertAAK = !this.insertAAK;
        } else {
            this.insertAAK = insertAAK;
        }
        this._changeDetectorRef.markForCheck();
    }


    
    toggleEditAHK(editAHK: boolean | null = null): void {
        if (editAHK === null) {
            this.editAHK = !this.editAHK;
        } else {
            this.editAHK = editAHK;
        }
        this._changeDetectorRef.markForCheck();
    }
    toggleEditPAK(editPAK: boolean | null = null): void {
        if (editPAK === null) {
            this.editPAK = !this.editPAK;
        } else {
            this.editPAK = editPAK;
        }
        this._changeDetectorRef.markForCheck();
    }
    toggleEditAAK(editAAK: boolean | null = null): void {
        if (editAAK === null) {
            this.editAAK = !this.editAAK;
        } else {
            this.editAAK = editAAK;
        }
        this._changeDetectorRef.markForCheck();
    }

    toggleDetailsAAK(id: string): void {
        if (this.selected && this.selected.id === id) {
            this.closeDetailsAAK();
            return;
        }

        this._penerjemahService.getRwAngkaKreditAkumulasiById(id)
            .subscribe((item) => {
                this.selected = item;
                this.formAAK.patchValue(item);
                this._changeDetectorRef.markForCheck();
            });
    }

    closeDetailsAAK(): void {
        this.selected = null;
    }

    toggleDetailsPAK(id: string): void {
        if (this.selected && this.selected.id === id) { 
            this.closeDetailsPAK();
            return;
        }

        this._penerjemahService.getRwAngkaKreditPenetapanById(id)
            .subscribe((item) => {
                this.selected = item;
                this.formPAK.patchValue(item);
                this._changeDetectorRef.markForCheck();
            });
    }

    closeDetailsPAK(): void {
        this.selected = null;
    }

    toggleDetailsAHK(id: string): void {
        if (this.selected && this.selected.id === id) {
            this.closeDetailsAHK();
            return;
        }

        this._penerjemahService.getRwAngkaKreditKonversiById(id)
            .subscribe((item) => {
                this.selected = item;
                this.formAHK.patchValue(item);
                this._changeDetectorRef.markForCheck();
            });
    }

    closeDetailsAHK(): void {
        this.selected = null;
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

        this._penerjemahService.getRwAngkaKreditById(id)
            .subscribe((item) => {
                this.selected = item;
                this.form.patchValue(item);
                this.form.get('tglSk').setValue(this._helperService.getDateFromStringID(item.tglSk));
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
