/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
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
import { CreateComponent } from 'app/modules/referensi/bahasa/create/create.component';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'app-penguasaan-bahasa',
    templateUrl: './penguasaan-bahasa.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class PenguasaanBahasaComponent implements OnInit, OnDestroy {
    rwPenguasaanBahasa: any[] = [];
    rwUsuls: any[] = [];
    pnsId: string;
    selected: any | null = null;
    editMode: boolean = false;
    insertMode: boolean = false;
    onFileInputed: boolean = false;
    tahun = this._referensiService.tahun();
    form: FormGroup;
    jenisBahasa$: Observable<any[]> = this._referensiService.jenisBahasa();
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
        private _dialog: MatDialog,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            newBahasaId: [null],
            beforeBahasaId: [null],
            bahasaId: [null, Validators.required],
            nilai: [null, Validators.required],
            tahun: [null, Validators.required],
            file: [null, Validators.required],
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

        this._penerjemahService.getPenguasaanBahasa(this.pnsId).subscribe();

        this._penerjemahService.penguasaanBahasa$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                console.log('Fetched Item:', item); 
                if (item) {
                    this.rwPenguasaanBahasa = item;
                    this._changeDetectorRef.markForCheck();
                }
            });

        this._penerjemahService.getHistoriUsulProfil({
            pnsId: this.pnsId,
            jenisUsul: 'KEMAHIRAN_BAHASA',
            size: 100
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe((items: any) => {
            if (items) {
                this.rwUsuls = items;
                this._changeDetectorRef.markForCheck();
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
        body.append('newBahasaId', formInput.bahasaId);
        if (formInput.bahasaId) { body.append('bahasaId', formInput.bahasaId); }
        if (formInput.tahun) { body.append('tahun', formInput.tahun); }
        if (formInput.nilai) { body.append('nilai', formInput.nilai); }
        if (formInput.file) { body.append('file', formInput.file); }

        this._penerjemahService.saveRwKemahiranBahasa(body).subscribe(
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
                this._penerjemahService.deleteKemahiranBahasa(this.selected.pnsId, this.selected.bahasa.id).subscribe(
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
        body.append('newBahasaId', formInput.bahasaId);
        if (formInput.beforeBahasaId !== formInput.bahasaId) {
            this._penerjemahService.deleteKemahiranBahasa(this.selected.pnsId, formInput.beforeBahasaId).subscribe();
        }
        if (formInput.bahasaId) { body.append('bahasaId', formInput.bahasaId); }

        this._penerjemahService.saveRwKemahiranBahasa(body).subscribe(
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

     toggleDetails(bahasaId: string): void {
    const foundItem = this.rwPenguasaanBahasa.find(item => item.bahasa.id === bahasaId);
    
    if (foundItem) {
        // Jika item yang sama diklik, tutup detail
        if (this.selected && this.selected.bahasa.id === foundItem.bahasa.id) {
            this.selected = null;
        } else {
            // Jika item berbeda, setel detail item yang baru
            this.selected = foundItem;
            this.form.patchValue(this.selected);
        }
        this._changeDetectorRef.markForCheck();
    } else {
        this._toastr.error('Detail tidak ditemukan', 'ERROR');
    }
}



    closeDetails(): void {
        this.selected = null;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    tambahBahasa(): void {
        const dialogRef = this._dialog.open(CreateComponent, {
            autoFocus: false
        });
        
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                // Refresh daftar bahasa
                this.jenisBahasa$ = this._referensiService.jenisBahasa();
                this._changeDetectorRef.markForCheck();
            }
        });
    }
}
