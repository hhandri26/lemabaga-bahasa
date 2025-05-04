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
import FileSaver from 'file-saver';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';

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
    @ViewChild('paginatorUndangan', { static: true }) paginatorUndangan: MatPaginator;

    kegiatanItems$: Observable<any[]>;
    isLoading: boolean = false;
    pagination: any;
    selected: any | null = null;
    form: FormGroup;
    pnsId: string;
    role: string = this._authService.role;
    statusKegiatanList = this._referensiService.statusKegiatanList();
    displayedColumns: string[] = ['namaKegiatan', 'jadwal', 'status', 'action'];
    dataSourceUndangan = new MatTableDataSource<any>();
    lengthUndangan = null;
    pageSizeUndangan = 10;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _kegiatanService: KegiatanService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toastr: ToastrService,
        private _formBuilder: FormBuilder,
        private _referensiService: ReferensiService,
        private _matDialog: MatDialog,
        private _authService: AuthService,
        private _userService: UserService,
    ) {

    }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            byStatus: [''],
            byDeskripsi: [null]
        });

        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: any) => {
            this.pnsId = user.pnsId;
            this._kegiatanService.getListUndangan(0, 10, { byPnsId: user.pnsId }).subscribe();
            this.kegiatanItems$ = this._kegiatanService.kegiatanItems$;

            this._kegiatanService.kegiatanItems$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe();
        });
        this._kegiatanService.pagination$
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
        //             return this._kegiatanService.getList(0, 10, {byDeskripsi: query});
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

    toggleConfirm(_item) {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Apakah Anda yakin untuk hadri pada kegiatan `' + _item.kegiatanSimpleDto.judul + '` ?',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:x',
                'color': 'warn'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': 'Konfirm hadir',
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
                const queryParams: any = {
                    id: _item.kegiatanSimpleDto.id,
                    isHadir: true
                  };
                this._kegiatanService.confirm(queryParams).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Kehadian untuk undangan kegiatan `' + _item.kegiatanSimpleDto.judul + '` telah berhasil dikonfirmasi');
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    fetch(page: number = 0, size: number = 10, search: any = {}) {
        search.byPnsId = this.pnsId;
        if (!search.byStatus) { search.byStatus = null; }
        return this._kegiatanService.getListUndangan(+page, +size, search).pipe();
    }

    toggleDetails(id: number): void {
        if (this.selected && this.selected.id === id) {
            this.closeDetails();
            return;
        }

        this._kegiatanService.getDetail(id)
            .subscribe((item: any) => {
                this.selected = item;
                this.dataSourceUndangan = new MatTableDataSource(this.selected.undanganDtoList.slice(0, this.pageSizeUndangan));
                this.dataSourceUndangan.paginator = this.paginatorUndangan;
                this.lengthUndangan = this.selected.undanganDtoList.length;
                this._changeDetectorRef.markForCheck();
            });
    }

    onPageChanged(e) {
        const firstCut = e.pageIndex * e.pageSize;
        const secondCut = firstCut + e.pageSize;
        this.dataSourceUndangan.data = this.selected.undanganDtoList.slice(firstCut, secondCut);
        this._changeDetectorRef.markForCheck();
    }

    closeDetails(): void {
        this.selected = null;
    }

    toggleDelete(id): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus undangan kegiatan',
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
                this._kegiatanService.deleteUndangan(id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Undangan kegiatan telah dihapus', 'Hapus Berhasil');
                            this.closeDetails();
                            this._kegiatanService.getList().subscribe();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    toggleOpenFile(fileUndanganUrl) {
        window.open(fileUndanganUrl, '_blank');
    }

    openConfirmationDialog(isApprove, nama, pnsId): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': (isApprove) ? 'Menyetujui kehadiran ' + nama : 'Menolak kehadiran ' + nama,
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
                this._kegiatanService.approvalUndangan({
                    isApprove,
                    pnsId,
                    'id': this.selected.id,
                    'alasan': null
                }).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Peserta ' + nama + ' telah dikonfirmasi', 'Konfirmasi Berhasil');
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
