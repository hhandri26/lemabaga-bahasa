/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ToastrService } from 'ngx-toastr';
import { ReferensiService } from 'app/services/referensi.service';
import { VerifikasiRiwayatService } from 'app/services/verifikasi-riwayat.service';
import { ProfilService } from 'app/services/profil.service';
import { MatDialog } from '@angular/material/dialog';
import { KoreksiKakComponent } from '../koreksi-kak/koreksi-kak.component';
import { ProsesUlangKakComponent } from '../proses-ulang-kak/proses-ulang-kak.component';
import { CetakKakComponent } from '../cetak-kak/cetak-kak.component';

@Component({
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FORMATS }
    ]
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    items$: Observable<any[]>;
    isLoading: boolean = false;
    pagination: any;
    // searchInputControl: FormControl = new FormControl();
    selected: any | null = null;
    form: FormGroup;
    message = null;
    jenisUsulan = this._referensiService.jenisUsulan();
    actionUsulan = this._referensiService.actionUsulan();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _verifikasiRiwayatService: VerifikasiRiwayatService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toastr: ToastrService,
        private _formBuilder: FormBuilder,
        private _referensiService: ReferensiService,
        private _profilService: ProfilService,
        private _matDialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            byJenisUsul: [''],
            byNama: [null]
        });

        this._verifikasiRiwayatService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: any) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this.items$ = this._verifikasiRiwayatService.items$;

        this._verifikasiRiwayatService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe();

        this._verifikasiRiwayatService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: any) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {
    }

    toggleKoreksiKak(data): void {
        const dialogRef = this._matDialog.open(KoreksiKakComponent, { autoFocus: false, data});
        dialogRef.afterClosed().subscribe((result) => {
            // if (result) {
            //     this._referensiInstansiService.getList().subscribe();
            // }
        });
    }

    toggleCetakKak(data): void {
        const dialogRef = this._matDialog.open(CetakKakComponent, { autoFocus: false, data});
        dialogRef.afterClosed().subscribe((result) => {
            // if (result) {
            //     this._referensiInstansiService.getList().subscribe();
            // }
        });
    }

    toggleProsesUlangKak(data): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Proses Ulang KAK ',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:check',
                'color': 'warn'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': 'Proses',
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
                this._profilService.reprocessKAK(data.id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Proses ulang KAK berhasil');
                            this.closeDetails();
                            this.fetch((this.pagination.draw), this.pagination.perPage, this.form.getRawValue()).subscribe();
                            this._changeDetectorRef.markForCheck();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    pageEvent(event: MatPaginator) {
        this.fetch(event.pageIndex, event.pageSize, this.form.getRawValue()).subscribe();
    }

    toggleSearch() {
        this.fetch((this.pagination.draw), this.pagination.perPage, this.form.getRawValue()).subscribe();
    }

    fetch(page: number = 0, size: number = 10, search: any = {}) {
        if (!search.byJenisUsul) { search.byJenisUsul = null; }
        return this._verifikasiRiwayatService.getList(+page, +size, search).pipe();
    }

    toggleDetails(id: number): void {
        if (this.selected && this.selected.id === id) {
            this.closeDetails();
            return;
        }

        this._verifikasiRiwayatService.getDetail(id)
            .subscribe((item: any) => {
                this.selected = item;
                this._changeDetectorRef.markForCheck();
            });
    }

    closeDetails(): void {
        this.selected = null;
    }

    _action(id) {
        const _item = this.actionUsulan.find(item => item.id === id) || null;
        return _item?.nama ?? '-';
    }

    togglePrint(dokumenId) {
		this._profilService.preview(dokumenId).subscribe((blob: any) => {
			const fileURL = URL.createObjectURL(blob);
			window.open(fileURL, '_blank');
		});
    }

    openConfirmationDialog(isApprove, usulId): void {
        if(!isApprove && !this.message){
            this._toastr.error('Untuk menolak Anda harus menjelaskan alasannya pada catatan hasil verifikasi', 'Alasan hasil verifikasi harus diisi');
            return;
        }
        const dialogRef = this._fuseConfirmationService.open({
            'title': (isApprove) ? 'Menyetujui verifikasi data ' : 'Menolak verifikasi data ',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': (isApprove) ? 'heroicons_outline:check' : 'heroicons_outline:x',
                'color': (isApprove) ? 'primary' : 'warn'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': (isApprove) ? 'Setuju' : 'Tolak',
                    'color': (isApprove) ? 'primary' : 'warn'
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
                const body: any = new FormData();
                body.append('isKonversiAK', false);
                body.append('isApprove', isApprove);
                body.append('usulId', usulId);
                body.append('message', this.message);

                this._verifikasiRiwayatService.approval(body).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Data telah diverifikasi', 'Konfirmasi Berhasil');
                            this.closeDetails();
                            this.fetch((this.pagination.draw), this.pagination.perPage, this.form.getRawValue()).subscribe();
                            this._changeDetectorRef.markForCheck();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    trackByFn(index: number, item: any): any {
        return String(item.id) || String(index);
    }

    trackByFnType(index: number, item: any): any {
        return item.id || index;
    }
}
