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
import { ToastrService } from 'ngx-toastr';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-pelatihan',
    templateUrl: './pelatihan.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class PelatihanComponent implements OnInit, OnDestroy {
    isLoading = false;
    resultPelatihan: any[] = [];
    rwPelatihan: any[] = [];
    rwUsuls: any[] = [];
    pnsId: string;
    selected: any | null = null;
    editMode: boolean = false;
    insertMode: boolean = false;
    onFileInputed: boolean = false;
    form: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _penerjemahService: PenerjemahService,
        private _referensiService: ReferensiService,
        private _helperService: HelperService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _toastr: ToastrService,
        private _authService: AuthService,
        private _userService: UserService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            pelatihanid: [null, Validators.required],
            nilai: [null, Validators.required],
            predikat: [null, Validators.required],
            peringkat: [null, Validators.required],
            jp: [null, Validators.required]
        });

        this.loadData();
        this.getPelatihanData();  // Ambil data pelatihan saat inisialisasi
    }

    getPelatihanData() {
        this._referensiService.pelatihan().subscribe((items: any) => {
            this.resultPelatihan = items.content;
            this._changeDetectorRef.markForCheck();
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

    insert(): void {
    const formInput: any = this.form.getRawValue();
    console.log('formInput:', formInput); // Letakkan di sini
    console.log('pelatihanid:', formInput.pelatihanid);
    
    const body = new FormData();
    body.append('pnsId', this.pnsId);
    if (formInput.pelatihanid) { body.append('pelatihanid', formInput.pelatihanid.id); }
    if (formInput.nilai) { body.append('nilai', formInput.nilai); }
    if (formInput.predikat) { body.append('predikat', formInput.predikat); }
    if (formInput.peringkat) { body.append('peringkat', formInput.peringkat); }
    if (formInput.jp) { body.append('jp', formInput.jp); }

    this._penerjemahService.saveRwPelatihan(body).subscribe((result) => {
        if (result?.success) {
            this._toastr.success('Selanjutnya usulan Anda akan diverifikasi oleh Admin', 'Usulan Tambah Berhasil');
            this.form.reset();
            this.loadData();
            this.toggleInsertMode(false);
            this.toggleEditMode(false);
        } else {
            this._toastr.error(result?.message, 'ERROR');
        }
    });
}

    update(): void {
        const formInput: any = this.form.getRawValue();
        const body = new FormData();
        body.append('pnsId', this.pnsId);
        body.append('id', this.selected.id);
        if (formInput.pelatihanid) { body.append('pelatihanid', formInput.pelatihanid.id); }
        if (formInput.nilai) { body.append('nilai', formInput.nilai); }
        if (formInput.predikat) { body.append('predikat', formInput.predikat); }
        if (formInput.peringkat) { body.append('peringkat', formInput.peringkat); }
        if (formInput.jp) { body.append('jp', formInput.jp); }

        this._penerjemahService.saveRwPelatihan(body).subscribe((result) => {
            if (result?.success) {
                this._toastr.success('Selanjutnya usulan Anda akan diverifikasi oleh Admin', 'Usulan Perubahan Berhasil');
                this.form.reset();
                this.loadData();
                this.toggleInsertMode(false);
                this.toggleEditMode(false);
            } else {
                this._toastr.error(result?.message, 'ERROR');
            }
        });
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
