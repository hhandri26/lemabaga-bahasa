/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { HelperService } from 'app/services/helper.service';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
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
export class InstansiComponent implements OnInit, OnDestroy {
    rwInstansi: any[] = [];
    pnsId: string;
    selected: any | null = null;
    editMode: boolean = false;
    insertMode: boolean = false;
    onFileInputed: boolean = false;
    form: FormGroup;
    jenisInstansi$: Observable<any[]> = this._referensiService.instansi();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _penerjemahService: PenerjemahService,
        private _referensiService: ReferensiService,
        private _helperService: HelperService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _toastr: ToastrService
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            instansiId: [null, Validators.required],
            noSk: [null, Validators.required],
            file: [null, Validators.required]
        });

        this.loadData();
    }

    loadData() {
        this._penerjemahService.jfpItem$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                this.pnsId = item.id;
                this._penerjemahService.getRwInstansi(item.id).subscribe();
                this._changeDetectorRef.markForCheck();
            });

        this._penerjemahService.rwInstansi$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                if (item) {
                    this.rwInstansi = item;
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
        if (formInput.instansiId) { body.append('instansiId', formInput.instansiId); }
        if (formInput.noSk) { body.append('noSk', formInput.noSk); }
        if (formInput.file) { body.append('file', formInput.file); }

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

    update(): void {
        const formInput: any = this.form.getRawValue();
        const body = new FormData();
        body.append('pnsId', this.pnsId);
        body.append('id', this.selected.id);
        if (formInput.instansiId) { body.append('instansiId', formInput.instansiId); }
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
