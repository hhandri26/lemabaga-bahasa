/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, fromEvent, Observable, Subject, takeUntil, tap } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ReferensiInstansiService } from 'app/services/referensi-instansi.service';
// import { DiklatService } from '../diklat.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DiklatService } from 'app/services/diklat.service';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
    templateUrl: './peserta.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class PesertaComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('filterByNama', { static: true }) findNama: ElementRef;
    form: FormGroup;
    jenisDiklat: any[];
    onFileInputed: boolean = false;
    byHasParticipant: any = null;
    instansiList: any[];
    jenisInstansiList = this._referensiService.jenisInstansiList();
    jenisJabatan$: Observable<any[]> = this._referensiService.jabatan();
    provinsi$: Observable<any[]> = this._referensiService.provinsi({ q: '' });
    bahasaList: Observable<any> = this._referensiService.jenisBahasa();
    dataSource = new MatTableDataSource<any>();
    displayedColumns = ['select', 'nama', 'instansi', 'status', 'undangan'];
    length = null;
    pageSize = 10;
    pesertaList: any[] = [];
    selectedPeserta: any[] = [];
    filterbyProvAlamatKantor: any = '';
    filterByBahasa: any = '';


    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<PesertaComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _penerjemahService: PenerjemahService,
        private _diklatService: DiklatService
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            courseId: [this._data?.id, [Validators.required]],
            pnsId: [0, [Validators.required, Validators.min(1)]]
        });

        this.fetch();
    }

    fetch() {
        this.fetchCandidate().subscribe((items: any) => {
            if (items) {
                this.instansiList = [...new Set(items.map(item => item.pnsInstansiNama))];
                this.pesertaList = items;
                this.selectedPeserta = [...new Set(items.filter(item => item.hasParticipant === true).map(item => item.pnsId))];
                console.log('this.selectedPeserta', this.selectedPeserta);
                this.dataSource = new MatTableDataSource(items);
                this.dataSource.paginator = this.paginator;
                this.length = items.length;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    ngAfterViewInit(): void {
        this._changeDetectorRef.markForCheck();
        fromEvent(this.findNama.nativeElement, 'keyup')
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(150),
                distinctUntilChanged(),
                tap(() => {
                    this.paginator.pageIndex = 0;
                    const items = this.pesertaList;
                    this.dataSource.data = items.filter(item => item.pnsNama.toLowerCase().includes((this.findNama.nativeElement.value).toLowerCase()));
                    this._changeDetectorRef.markForCheck();
                })
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    fetchCandidate() {
        const params: any = {
            'byCourseId': this._data?.id,
            'byHasParticipant': this.byHasParticipant
        };
        return this._diklatService.getCandidateList(params).pipe(
            takeUntil(this._unsubscribeAll)
        );
    }

    onPageChanged(e) {
        const items = this.pesertaList;
        const firstCut = e.pageIndex * e.pageSize;
        const secondCut = firstCut + e.pageSize;
        this.dataSource.data = items.slice(firstCut, secondCut);
        this._changeDetectorRef.markForCheck();
    }

    toggleUndangan(change: MatSlideToggleChange): void {
        if (change.checked) {
            this.paginator.pageIndex = 0;
            const items = this.pesertaList;
            this.dataSource.data = items.filter(item => item.hasInvitationSent === change.checked);
            this._changeDetectorRef.markForCheck();
        } else {
            this.fetch();
        }

    }

    filterByStatus(change: MatSelectChange): void {
        if (change.value !== '') {
            this.paginator.pageIndex = 0;
            const items = this.pesertaList;
            this.dataSource.data = items.filter(item => item.statusCandidateParticipant === change.value);
            this._changeDetectorRef.markForCheck();
        } else {
            this.fetch();
        }
    }

    filterByPeserta(change: MatSelectChange): void {
        this.byHasParticipant = change.value;
        if (change.value === '') {
            this.byHasParticipant = null;
        }
        this.fetch();
    }

    filterByInstansi(change: MatSelectChange): void {
        if (change.value !== '') {
            this.paginator.pageIndex = 0;
            const items = this.pesertaList;
            this.dataSource.data = items.filter(item => item.pnsInstansiNama === change.value);
            this._changeDetectorRef.markForCheck();
        } else {
            this.fetch();
        }
    }

    openConfirmationUndangDialog(formInput, total): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Mengundang Pserta Diklat/Kursus, sejumlah ' + total + ' Peserta',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:check',
                'color': 'primary'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': 'Kirim undangan',
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
                this._diklatService.sendInvitation(JSON.stringify(formInput)).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Undangan telah dikirim', 'Tambah referensi instansi berhasil');
                            this.form.reset();
                            this.matDialogRef.close(true);
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    exists(item) {
        return this.selectedPeserta.find(selected => selected === item);
    }

    isIndeterminate() {
        return (this.selectedPeserta.length > 0 && !this.isChecked());
    }

    isChecked() {
        return this.selectedPeserta.length === this.pesertaList.length;
    }

    toggle(item, event: MatCheckboxChange) {
        if (event.checked) {
            if (!this.selectedPeserta.find(selected => selected === item)) {
                this.selectedPeserta.push(item.pnsId);
                this.form.get('pnsId').setValue(this.selectedPeserta);
            }
        } else {
            const index = this.selectedPeserta.map(selected => selected).indexOf(item);
            this.selectedPeserta.splice(index, 1);
            this.form.get('pnsId').setValue(this.selectedPeserta);
        }
    }

    toggleAll(event: MatCheckboxChange) {
        if (event.checked) {
            this.pesertaList.forEach((row) => {
                this.selectedPeserta.push(row.pnsId);
            });
        } else {
            this.selectedPeserta.length = 0;
        }
    }

    save(): void {
        const formInput = this.form.getRawValue();
        formInput.pnsId = formInput.pnsId;
        // const body = new FormData();
        // body.append('courseId', formInput.courseId);
        // body.append('pnsId', JSON.stringify(formInput.pnsId));
        this._diklatService.addParticipant(JSON.stringify(formInput)).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Peserta berhasil disimpan');
                    this.form.reset();
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    send(): void {
        const formInput = this.form.getRawValue();
        formInput.pnsId = formInput.pnsId;
        // const body = new FormData();
        // body.append('courseId', formInput.courseId);
        // body.append('pnsId',  JSON.stringify(formInput.pnsId));
        this.openConfirmationUndangDialog(formInput, formInput.pnsId.length);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
