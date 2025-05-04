/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ToastrService } from 'ngx-toastr';
import { ReferensiService } from 'app/services/referensi.service';
import { MatDialog } from '@angular/material/dialog';
import { FormasiService } from 'app/services/formasi.service';
import { AuthService } from 'app/core/auth/auth.service';
import { CreateComponent } from '../create/create.component';
import { PengangkatanService } from 'app/services/pengangkatan.service';
import { SubmitUsulanComponent } from '../submit-usulan/submit-usulan.component';
import { DetailUsulanComponent } from '../detail-usulan/detail-usulan.component';
import { SubmitUsulanApprovedComponent } from '../submit-usulan-approved/submit-usulan-approved.component';
import { ReturnUsulComponent } from '../return-usul/return-usul.component';
import { SubmitSkComponent } from '../submit-sk/submit-sk.component';
import { SetCompleteComponent } from '../set-complete/set-complete.component';

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
    selected: any;
    usulanLists: any[] = [];
    form: FormGroup;
    role = this._authService.role;
    jenisJabatan$: Observable<any[]> = this._referensiService.jabatan();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formasiService: FormasiService,
        private _pengangkatanService: PengangkatanService,
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
        this._pengangkatanService.getList(0, 100, {filters: {byFormasiDetailId: id}})
            .subscribe((item: any) => {

                // this.selected.id = id;
                this.selected = item;
                this.selected.id = id;
                this._changeDetectorRef.markForCheck();
                // this._formasiService.getHistory(id)
                //     .subscribe((_item: any) => {
                //         this.selected.histories = _item;
                //         this._changeDetectorRef.markForCheck();
                //     });
            });

    }

    closeDetails(): void {
        this.selected = null;
    }

    toggleCreate(formasiDetailId): void {
        const dialogRef = this._matDialog.open(CreateComponent, {  data: formasiDetailId, autoFocus: false});
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.closeDetails();
                this.toggleDetails(this.selected.id);
            }
        });
    }

    toggleRevisiUsulan(formasiDetailId): void {
        const dialogRef = this._matDialog.open(CreateComponent, { data: {formasiDetailId}, autoFocus: false});
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.closeDetails();
                this.toggleDetails(this.selected.id);
            }
        });
    }

    toggleSubmitUsulan(item): void {
        const dialogRef = this._matDialog.open(SubmitUsulanComponent, { autoFocus: false, data: item });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.closeDetails();
                this.toggleDetails(this.selected.id);
            }
        });
    }

    toggleSubmitSk(pengangkatanId): void {
        const dialogRef = this._matDialog.open(SubmitSkComponent, { autoFocus: false, data: pengangkatanId });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.closeDetails();
                this.toggleDetails(this.selected.id);
            }
        });
    }

    toggleComplete(item): void {
        const dialogRef = this._matDialog.open(SetCompleteComponent, { autoFocus: false, data: item });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.closeDetails();
                this.toggleDetails(this.selected.id);
            }
        });
    }

    toggleSubmitUsulanApproved(pengangkatanId): void {
        const dialogRef = this._matDialog.open(SubmitUsulanApprovedComponent, { autoFocus: false, data: pengangkatanId });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.closeDetails();
                this.toggleDetails(this.selected.id);
            }
        });
    }

    toggleDetailUsulan(id): void {
        this._pengangkatanService.getDetail(id).subscribe((item: any) => {
            if(item){
                const dialogRef = this._matDialog.open(DetailUsulanComponent, { width: '70%', autoFocus: false, data: item });
                dialogRef.afterClosed().subscribe((result) => {
                    if (result) {
                        this.closeDetails();
                        this.toggleDetails(this.selected.id);
                    }
                });
            } else {
                this._toastr.error('tidak dapat menampilkan usulan #id ' + id, 'ERROR');
            }
        });
    }

    returnUsul(item): void {
        const dialogRef = this._matDialog.open(ReturnUsulComponent, { autoFocus: false, data: item });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.closeDetails();
                this.toggleDetails(this.selected.id);
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
