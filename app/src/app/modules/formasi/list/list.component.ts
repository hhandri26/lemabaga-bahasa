/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { KegiatanService } from 'app/services/kegiatan.service';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ToastrService } from 'ngx-toastr';
import { ReferensiService } from 'app/services/referensi.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from '../create/create.component';
import FileSaver from 'file-saver';
import { FormasiService } from 'app/services/formasi.service';
import { UserService } from 'app/core/user/user.service';
import { AuthService } from 'app/core/auth/auth.service';
import { ReturnUsulComponent } from '../return-usul/return-usul.component';
import { ApproveUsulComponent } from '../approve-usul/approve-usul.component';
import { ApproveMenpanComponent } from '../approve-menpan/approve-menpan.component';
import { ReturnFinalComponent } from '../return-final/return-final.component';

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
    items$: Observable<any[]>;
    isLoading: boolean = false;
    pagination: any;
    selected: any = null;
    form: FormGroup;
    role = this._authService.role;
    jenisJabatan$: Observable<any[]> = this._referensiService.jabatan();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formasiService: FormasiService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toastr: ToastrService,
        private _formBuilder: FormBuilder,
        private _referensiService: ReferensiService,
        private _matDialog: MatDialog,
        private _authService: AuthService,
    ) {
    }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            byJabatanId: [''],
            byDeskripsi: [null]
        });

        this._formasiService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: any) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this.items$ = this._formasiService.items$;

        this._formasiService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe();

        this._formasiService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: any) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        // this.searchInputControl.valueChanges
        //     .pipe(
        //         takeUntil(this._unsubscribeAll),
        //         debounceTime(300),
        //         switchMap((query) => {
        //             this.closeDetails();
        //             this.isLoading = true;
        //             return this._formasiService.getList(0, 10, {byDeskripsi: query});
        //         }),
        //         map(() => {
        //             this.isLoading = false;
        //         })
        //     ).subscribe();
    }

    ngAfterViewInit(): void {
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
        if (!search.byStatus) { search.byStatus = null; }
        return this._formasiService.getList(+page, +size, search).pipe();
    }

    toggleDetails(id: number): void {
        if (this.selected && this.selected.id === id) {
            this.closeDetails();
            return;
        }

        this._formasiService.getDetail(id)
            .subscribe((item: any) => {
                this.selected = item;
                this._formasiService.getHistory(id)
                    .subscribe((_item: any) => {
                        this.selected.histories = _item;
                        this._changeDetectorRef.markForCheck();
                    });
            });

    }

    closeDetails(): void {
        this.selected = null;
    }

    create(): void {
        const dialogRef = this._matDialog.open(CreateComponent, { autoFocus: false, width: '100%' });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._formasiService.getList().subscribe();
            }
        });
    }

    approveUsul(formasiId): void {
        const dialogRef = this._matDialog.open(ApproveUsulComponent, { autoFocus: false, data: formasiId });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._formasiService.getList().subscribe();
                this.closeDetails();
                this.toggleDetails(formasiId);
            }
        });
    }

    toggleApprovedMenpan(formasiId): void {
        const data = { formasiId: formasiId, formasiDetails: this.selected.formasiDetails };
        const dialogRef = this._matDialog.open(ApproveMenpanComponent, { width: '100%', autoFocus: false, data });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._formasiService.getList().subscribe();
                this.closeDetails();
                this.toggleDetails(formasiId);
            }
        });
    }

    toggleTolakFinal(formasiId): void {
        const data = { formasiId: formasiId, formasiDetails: this.selected.formasiDetails };
        const dialogRef = this._matDialog.open(ReturnFinalComponent, { width: '100%', autoFocus: false, data });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._formasiService.getList().subscribe();
                this.closeDetails();
                this.toggleDetails(formasiId);
            }
        });
    }

    returnUsul(formasiId): void {
        const dialogRef = this._matDialog.open(ReturnUsulComponent, { autoFocus: false, data: formasiId });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._formasiService.getList().subscribe();
                this.closeDetails();
                this.toggleDetails(formasiId);
            }
        });
    }

    toggleDelete(id): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus usulan formasi',
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
                // this._formasiService.deleteUndangan(id).subscribe(
                //     (result) => {
                //         if (result?.success) {
                //             this._toastr.success('Undangan kegiatan telah dihapus', 'Hapus Berhasil');
                //             this.closeDetails();
                //             this._formasiService.getList().subscribe();
                //         } else {
                //             this._toastr.error(result?.message, 'ERROR');
                //         }
                //     }
                // );
            }
        });
    }

    toggleSubmitUsulan(formasiId): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Submit usulan formasi',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:x',
                'color': 'warn'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': 'Konfirm Submit',
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
                const body = new FormData();
                body.append('formasiId', formasiId);
                this._formasiService.submitUsul(body).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Submit Berhasil, selanjutnya menunggu konfirmasi surat rekomendasi dari Pembina');
                            this.closeDetails();
                            this._formasiService.getList().subscribe();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    toggleSetujuFinal(formasiId): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Menyetujui usulan formasi dari KEMENPAN',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:x',
                'color': 'warn'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': 'Konfirm Submit',
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
                const body = new FormData();
                const isCorrection: any = false;
                body.append('formasiId', formasiId);
                body.append('isCorrection', isCorrection);
                this._formasiService.setComplete(body).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Submit Berhasil, selanjutnya dapat dilakukan pengangkatan PFP oleh unit Kepegawaian');
                            this.closeDetails();
                            this._formasiService.getList().subscribe();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    togglePrint(id) {
        this._formasiService.cetak(id).subscribe({
            next: (result) => {
                const fileURL = URL.createObjectURL(result);
                window.open(fileURL, '_blank');
            },
            error: () => {
                this._toastr.error('ERROR: Dokumen gagal ditampilkan', 'ERROR');
            }
        });
    }

    trackByFn(index: number, item: any): any {
        return String(item.id) || String(index);
    }
}
