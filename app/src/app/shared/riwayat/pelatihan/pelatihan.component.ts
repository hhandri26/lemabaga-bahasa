/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { HelperService } from 'app/services/helper.service';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { ReferensiService, YEAR_FORMATS } from 'app/services/referensi.service';
import moment, { Moment } from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-pelatihan',
    templateUrl: './pelatihan.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: YEAR_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class PelatihanComponent implements OnInit, OnDestroy {
    rwPelatihan: any[] = [];
    rwUsuls: any[] = [];
    pnsId: string;
    selected: any | null = null;
    editMode: boolean = false;
    insertMode: boolean = false;
    onFileInputed: boolean = false;
    form: FormGroup;
    lingkupPelatihan = this._referensiService.lingkupPelatihan();
    onChange = (year: Date) => { };
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    jenisPelatihan$: Observable<any[]> = this._referensiService.pelatihan();
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
             nama: [null, Validators.required],
            tahun: [moment(), Validators.required],
            lingkupPelatihan: [null, Validators.required],
            institusi: [null, Validators.required],
            file: [null, Validators.required],
            pelatihanId: [null, Validators.required],
            nilai: [null, Validators.required],
            predikat: [null, Validators.required],
            peringkat: [null, Validators.required],
            jp: [null, Validators.required]
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

        this._penerjemahService.getRwPelatihan(this.pnsId).subscribe();

        this._penerjemahService.rwPelatihan$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                if (item) {
                    this.rwPelatihan = item;
                    this._changeDetectorRef.markForCheck();
                }
            });

        this._penerjemahService.getHistoriUsulProfil({
            pnsId: this.pnsId,
            jenisUsul: 'RW_PELATIHAN',
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
       if (formInput.pelatihanId) { body.append('pelatihanId', formInput.pelatihanId); }
    if (formInput.nilai) { body.append('nilai', formInput.nilai); }
    if (formInput.predikat) { body.append('predikat', formInput.predikat); }
    if (formInput.peringkat) { body.append('peringkat', formInput.peringkat); }
    if (formInput.jp) { body.append('jp', formInput.jp); }
    if (formInput.nama) { body.append('nama', formInput.nama); }
    if (formInput.tahun) { body.append('tahun', moment(formInput.tahun).format('YYYY')); }
    if (formInput.lingkupPelatihan) { body.append('lingkupPelatihan', formInput.lingkupPelatihan); }
    if (formInput.institusi) { body.append('institusi', formInput.institusi); }
    if (formInput.file) { body.append('file', formInput.file); }

        this._penerjemahService.saveRwPelatihan(body).subscribe(
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
        this._penerjemahService.deleteRwPelatihan(this.selected.id).subscribe(
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
        if (formInput.nama) { body.append('nama', formInput.nama); }
        if (formInput.tahun) { body.append('tahun', moment(formInput.tahun).format('YYYY')); }
        if (formInput.lingkupPelatihan) { body.append('lingkupPelatihan', formInput.lingkupPelatihan); }
        if (formInput.institusi) { body.append('institusi', formInput.institusi); }
        if (formInput.file) { body.append('file', formInput.file); }
       if (formInput.pelatihanId) { body.append('pelatihanId', formInput.pelatihanId); }
    if (formInput.nilai) { body.append('nilai', formInput.nilai); }
    if (formInput.predikat) { body.append('predikat', formInput.predikat); }
    if (formInput.peringkat) { body.append('peringkat', formInput.peringkat); }
    if (formInput.jp) { body.append('jp', formInput.jp); }
    if (formInput.nama) { body.append('nama', formInput.nama); }
    if (formInput.tahun) { body.append('tahun', moment(formInput.tahun).format('YYYY')); }
    if (formInput.lingkupPelatihan) { body.append('lingkupPelatihan', formInput.lingkupPelatihan); }
    if (formInput.institusi) { body.append('institusi', formInput.institusi); }
    if (formInput.file) { body.append('file', formInput.file); }

        this._penerjemahService.saveRwPelatihan(body).subscribe(
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

    chosenYearHandler(normalizedYear: Moment, _tahun: any) {
        const ctrlValue = this.form.get('tahun').value;
        ctrlValue.year(normalizedYear.year());
        this.form.get('tahun').setValue(ctrlValue);
        this._changeDetectorRef.markForCheck();
        _tahun.close();
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

        this._penerjemahService.getRwPelatihanById(id)
            .subscribe((item) => {
                this.selected = item;
                this.form.patchValue(item);
                this.form.get('tahun').setValue(moment(this._helperService.getDateFromStringID('01-01-' + item.tahun)));
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
