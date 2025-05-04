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
import { CreateComponent } from '../create/create.component';
import { KonselingService } from 'app/services/konseling.service';
import { environment } from 'environments/environment';

@Component({
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FORMATS }
    ]
})
export class ListComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    items$: Observable<any[]>;
    isLoading: boolean = false;
    pagination: any;
    baseUrl = environment.baseUrl;
    // searchInputControl: FormControl = new FormControl();
    selected: any | null = null;
    form: FormGroup;
    message = null;
    lampiran = null;
    filters: any = {
        'filters': {
            'byTitle': null,
            'byStatus': null,
            'byCategoryId': null,
            'byType': null
        }
    };
    onFileInputed: boolean = false;
    statusKonseling = this._referensiService.statusKonseling();
    actionUsulan = this._referensiService.actionUsulan();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _verifikasiRiwayatService: VerifikasiRiwayatService,
        private _konselingService: KonselingService,
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
            byNama: [null],
            file: [null]
        });

        this._konselingService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: any) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this.items$ = this._konselingService.items$;

        this._konselingService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe();

        this._konselingService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: any) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    toggleCreate(): void {
        const dialogRef = this._matDialog.open(CreateComponent, { autoFocus: false });
        dialogRef.afterClosed().subscribe((result) => {
            // if (result) {
            //     this._referensiInstansiService.getList().subscribe();
            // }
        });
    }

    // pageEvent(event: MatPaginator) {
    //     this.fetch(event.pageIndex, event.pageSize, this.form.getRawValue()).subscribe();
    // }

    // toggleSearch() {
    //     this.fetch((this.pagination.draw), this.pagination.perPage, this.form.getRawValue()).subscribe();
    // }

    fetch(isFilter: boolean = false): void {
        if (isFilter) {
            this._konselingService.getList(0, 1000, this.filters).pipe(takeUntil(this._unsubscribeAll)).subscribe();
        } else {
            this._konselingService.getList().pipe(takeUntil(this._unsubscribeAll)).subscribe();
        }

        this.items$ = this._konselingService.items$;
        this._changeDetectorRef.markForCheck();
    }

    toggleDetails(id: number): void {
        if (this.selected && this.selected.id === id) {
            this.closeDetails();
            return;
        }

        this._konselingService.getById(id)
            .subscribe((item: any) => {
                this.selected = item;
                this._changeDetectorRef.markForCheck();
            });
    }

    closeDetails(): void {
        this.selected = null;
    }


    openConfirmationDialog(id): void {
        if (!this.message) {
            this._toastr.error('Untuk menyelesaikan konseling, wajib mengisi keterangan');
            return;
        }
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Menyelesaikan konseling ',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:check',
                'color': 'primary'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': 'Selesai',
                    'color': 'primary'
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
                const formInput = this.form.getRawValue();
                const body: any = new FormData();
                body.append('id', id);
                body.append('catatan', this.message);
                if (formInput.file) { body.append('file', formInput.file); }
                this._konselingService.finish(body).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Konseling telah selesai');
                            this.closeDetails();
                            this._konselingService.getList().pipe(takeUntil(this._unsubscribeAll)).subscribe();
                            this._changeDetectorRef.markForCheck();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    toggleDelete(id): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus Konseling',
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
                this._konselingService.delete(id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('konseling telah dihapus');
                            this.fetch();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
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

    trackByFn(index: number, item: any): any {
        return String(item.id) || String(index);
    }

    trackByFnType(index: number, item: any): any {
        return item.id || index;
    }
}
