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

@Component({
    selector: 'app-kegiatan-penerjemahan',
    templateUrl: './kegiatan-penerjemahan.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class KegiatanPenerjemahanComponent implements OnInit, OnDestroy {
    rwKegiatanTranslasi: any[] = [];
    rwUsuls: any[] = [];
    pnsId: string;
    selected: any | null = null;
    editMode: boolean = false;
    insertMode: boolean = false;
    onFileInputed: boolean = false;
    form: FormGroup;
    jenisKegiatanTranslasi$: Observable<any[]> = this._referensiService.jenisKegiatanTranslasi();
    jenisBahasa$: Observable<any[]> = this._referensiService.jenisBahasa();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _penerjemahService: PenerjemahService,
        private _referensiService: ReferensiService,
        private _helperService: HelperService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _toastr: ToastrService,
        private _authService: AuthService,
        private _userService: UserService
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            lokasiKegiatan: [null, Validators.required],
            bahasaSourceId: [null, Validators.required],
            bahasaTargetId: [null, Validators.required],
            jenisKegiatanId: [null, Validators.required],
            tglKegiatan: [null, Validators.required],
            instansiPenugasan: [null, Validators.required],
            namaKegiatan: [null, Validators.required]
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

        this._penerjemahService.getRwKegiatanTranslasi(this.pnsId).subscribe();

        this._penerjemahService.rwKegiatanTranslasi$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                if (item) {
                    this.rwKegiatanTranslasi = item;
                    this._changeDetectorRef.markForCheck();
                }
            });

        this._penerjemahService.getHistoriUsulProfil({
            pnsId: this.pnsId,
            jenisUsul: 'RW_KEG_TRANSLASI',
            size: 100
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe((items: any) => {
            if (items) {
                this.rwUsuls = items;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    insert(): void {
        const formInput: any = this.form.getRawValue();
        const body = new FormData();
        body.append('pnsId', this.pnsId);
        if (formInput.lokasiKegiatan) { body.append('lokasiKegiatan', formInput.lokasiKegiatan); }
        if (formInput.bahasaSourceId) { body.append('bahasaSourceId', formInput.bahasaSourceId); }
        if (formInput.bahasaTargetId) { body.append('bahasaTargetId', formInput.bahasaTargetId); }
        if (formInput.jenisKegiatanId) { body.append('jenisKegiatanId', formInput.jenisKegiatanId); }
        if (formInput.tglKegiatan) { body.append('tglKegiatan', moment(formInput.tglKegiatan).format('DD-MM-YYYY')); }
        if (formInput.instansiPenugasan) { body.append('instansiPenugasan', formInput.instansiPenugasan); }
        if (formInput.namaKegiatan) { body.append('namaKegiatan', formInput.namaKegiatan); }

        this._penerjemahService.saveRwKegiatanTranslasi(body).subscribe(
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
        this._penerjemahService.deleteRwKegiatanTranslasi(this.selected.id).subscribe(
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

    update(): void {
        const formInput: any = this.form.getRawValue();
        const body = new FormData();
        body.append('pnsId', this.pnsId);
        body.append('id', this.selected.id);
        if (formInput.lokasiKegiatan) { body.append('lokasiKegiatan', formInput.lokasiKegiatan); }
        if (formInput.bahasaSourceId) { body.append('bahasaSourceId', formInput.bahasaSourceId); }
        if (formInput.bahasaTargetId) { body.append('bahasaTargetId', formInput.bahasaTargetId); }
        if (formInput.jenisKegiatanId) { body.append('jenisKegiatanId', formInput.jenisKegiatanId); }
        if (formInput.tglKegiatan) { body.append('tglKegiatan', moment(formInput.tglKegiatan).format('DD-MM-YYYY')); }
        if (formInput.instansiPenugasan) { body.append('instansiPenugasan', formInput.instansiPenugasan); }
        if (formInput.namaKegiatan) { body.append('namaKegiatan', formInput.namaKegiatan); }

        this._penerjemahService.saveRwKegiatanTranslasi(body).subscribe(
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

    toggleDetails(id: string): void {
        if (this.selected && this.selected.id === id) {
            this.closeDetails();
            return;
        }

        this._penerjemahService.getRwKegiatanTranslasiById(id)
            .subscribe((item) => {
                this.selected = item;
                this.form.patchValue(item);
                this.form.get('tglKegiatan').setValue(this._helperService.getDateFromStringID(item.tglKegiatan));
                this.form.get('bahasaSourceId').setValue(item.bahasaSource.id);
                this.form.get('bahasaTargetId').setValue(item.bahasaTarget.id);
                this.form.get('jenisKegiatanId').setValue(item.jenisKegiatanTranslasiId);
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
