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
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DiklatService } from 'app/services/diklat.service';

@Component({
    templateUrl: './sertifikat.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class SertifikatComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('filterByNama', { static: true }) findNama: ElementRef;
    form: FormGroup;
    jenisDiklat: any[];
    onFileInputed: boolean = false;
    jenisInstansiList = this._referensiService.jenisInstansiList();
    jenisJabatan$: Observable<any[]> = this._referensiService.jabatan();
    provinsi$: Observable<any[]> = this._referensiService.provinsi({ q: '' });
    bahasaList: Observable<any> = this._referensiService.jenisBahasa();
    dataSource = new MatTableDataSource<any>();
    displayedColumns = ['nama', 'keterangan', 'undang', 'kualifikasi', 'aksi'];
    length = null;
    pageSize = 10;
    pesertaList: any[] = [];
    selectedPeserta: any[] = [];
    filterbyProvAlamatKantor: any = '';
    filterByBahasa: any = '';
    random: number;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<SertifikatComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _diklatService: DiklatService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _referensiInstansiService: ReferensiInstansiService,
        private _penerjemahService: PenerjemahService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            jenis: [(this._data?.category) ? this._data?.category : '', [Validators.required]],
            judul: [(this._data?.title) ? this._data?.title : '', [Validators.required]],
            deskripsi: [(this._data?.description) ? this._data?.description : '', [Validators.required]],
            tglMulai: ['', [Validators.required]],
            tglAkhir: ['', [Validators.required]],
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

    generateValue(): number {
        return Math.floor(Math.random() * (100 - 85 + 1) + 85);
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
        return this._diklatService.getCourseAssessmentList(this._data.id).pipe(
            takeUntil(this._unsubscribeAll)
        );
        // return this._penerjemahService.getJfpList(search).pipe(
        //     takeUntil(this._unsubscribeAll)
        // );
    }

    onPageChanged(e) {
        const items = this.pesertaList;
        const firstCut = e.pageIndex * e.pageSize;
        const secondCut = firstCut + e.pageSize;
        this.dataSource.data = items.slice(firstCut, secondCut);
        this._changeDetectorRef.markForCheck();
    }

    filter() {
        this.fetchJfp().subscribe((items) => {
            if (items?.success) {
                this.pesertaList = items.mapData.data;
                this.dataSource = new MatTableDataSource(items.mapData.data);
                this.dataSource.paginator = this.paginator;
                this.length = (items.mapData.data).length;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    preview(row): void {
        // this._diklatService.previewSertifikat({
        //     courseId: this._data.id,
        //     pnsId: row.participant.pnsId
        // }).pipe(
        //     takeUntil(this._unsubscribeAll)
        // ).subscribe((item) => {
        //     if (item.success) {
        //         this._toastr.success('Nilai pesert `' + row.participant.nama + '` berhasil diset');
        //     }
        // });
        console.log(this._data);
        this._diklatService.previewSertifikat({
            courseId: this._data.id,
            pnsId: row.participant.id
        }).subscribe((blob: any) => {
            if (blob) {
                const fileURL = URL.createObjectURL(blob);
                window.open(fileURL, '_blank');
            }
        });
    }


    exists(item) {
        return this.selectedPeserta.find(selected => selected.id === item.id);
    }

    isIndeterminate() {
        return (this.selectedPeserta.length > 0 && !this.isChecked());
    }

    isChecked() {
        return this.selectedPeserta.length === this.pesertaList.length;
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

    create(): void {
        const params: any = this.form.getRawValue();
        this._referensiInstansiService.save(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Referensi instansi berhasil ditambahkan', 'Tambah referensi instansi berhasil');
                    this.form.reset();
                    this.matDialogRef.close(true);
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
