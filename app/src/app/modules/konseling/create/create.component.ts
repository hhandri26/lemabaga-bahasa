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
import { ReferensiPendidikanService } from 'app/services/referensi-pendidikan.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import moment from 'moment';
import { KonselingService } from 'app/services/konseling.service';
import { unset } from 'lodash';

@Component({
    templateUrl: './create.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CreateComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('filterByNama', { static: true }) findNama: ElementRef;
    form: FormGroup;
    kategori: any[];
    onFileInputed: boolean = false;

    dataSource = new MatTableDataSource<any>();
    displayedColumns = ['select', 'nama', 'jabatanNama', 'bahasas'];
    length = null;
    pageSize = 10;

    pesertaList: any[] = [];
    selectedPeserta: any[] = [];

    jenisJabatan$: Observable<any[]> = this._referensiService.jabatan();
    provinsi$: Observable<any[]> = this._referensiService.provinsi({ q: '' });
    bahasaList: Observable<any> = this._referensiService.jenisBahasa();

    filterbyProvAlamatKantor: any = '';
    filterByBahasa: any = '';

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _konselingService: KonselingService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _penerjemahService: PenerjemahService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            judul: ['', [Validators.required]],
            deskripsi: ['', [Validators.required]],
            tanggal: ['', [Validators.required]],
            time: [null, [Validators.required]],
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
                    this._changeDetectorRef.markForCheck();
                    this.filter();
                })
            )
            .subscribe();

        this.filter();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onPageChanged(e) {
        const items = this.pesertaList;
        const firstCut = e.pageIndex * e.pageSize;
        const secondCut = firstCut + e.pageSize;
        this.dataSource.data = items.slice(firstCut, secondCut);
        this._changeDetectorRef.markForCheck();
    }

    fetchJfp() {
        const search: any = {
            // 'byUnitKerja': (this.filterUnitKerjaList) ? this.filterUnitKerjaList : null,
            'byBahasa': (this.filterByBahasa.length > 0) ? this.filterByBahasa.map((bahasa: any) => bahasa.id) : null,
            'byProvAlamatKantor': (this.filterbyProvAlamatKantor) ? this.filterbyProvAlamatKantor : null,
            'byNama': (this.findNama.nativeElement.value) ? this.findNama.nativeElement.value : null,
            'byIsUserExisted': true,
            // 'sortBy': (this.sort.active) ? this.sort.active : 'nama',
            // 'sort': (this.sort.direction) ? this.sort.direction.toUpperCase() : 'ASC',
            // 'size': (this.paginator.pageSize) ? this.paginator.pageSize : 10000,
            // 'page': this.paginator.pageIndex
            'size': 10000,
            'page': 0
        };
        return this._penerjemahService.getJfpList(search).pipe(
            takeUntil(this._unsubscribeAll)
        );
    }

    filter() {
        this.fetchJfp().subscribe((items) => {
            if (items?.content) {
                this.pesertaList = items.content;
                this.dataSource = new MatTableDataSource(items.content);
                this.dataSource.paginator = this.paginator;
                this.length = items.totalElements;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    exists(item) {
        return this.selectedPeserta.find(selected => selected.id === item.id);
    }

    isIndeterminate() {
        return (this.selectedPeserta.length > 0 && !this.isChecked());
    }

    toggle(item, event: MatCheckboxChange) {
        if (event.checked) {
            if (!this.selectedPeserta.find(selected => selected.id === item.id)) {
                this.selectedPeserta.push(item);
            }
        } else {
            const index = this.selectedPeserta.map(selected => selected.id).indexOf(item.id);
            this.selectedPeserta.splice(index, 1);
        }
    }

    toggleAll(event: MatCheckboxChange) {
        if (event.checked) {
            this.pesertaList.forEach((row) => {
                this.selectedPeserta.push(row);
            });
        } else {
            this.selectedPeserta.length = 0;
        }
    }

    isChecked() {
        return this.selectedPeserta.length === this.pesertaList.length;
    }

    create(): void {
        const params: any = this.form.getRawValue();
        if (this.selectedPeserta.length > 0) {
            const pnsIds = [];
            this.selectedPeserta.forEach((item) => {
                pnsIds.push(item.id);
            });
            params.peserta = pnsIds;
            // body.append('pnsIds', JSON.stringify(pnsIds.filter((v, i, a) => a.indexOf(v) === i)));
        }
        params.tanggal = moment(params.tanggal).format('YYYY-MM-DD') + ' ' + (params.time).substring(0,2) + ':' + (params.time).substring(2,4);
        delete params.time;
        this._konselingService.save(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('konesling berhasil ditambahkan');
                    this.form.reset();
                    this.matDialogRef.close(true);
                    this._konselingService.getList().pipe(takeUntil(this._unsubscribeAll)).subscribe();
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
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
        return item.id || index;
    }
}
