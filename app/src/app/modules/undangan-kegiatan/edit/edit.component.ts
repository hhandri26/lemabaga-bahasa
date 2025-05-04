/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, fromEvent, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { KegiatanService } from 'app/services/kegiatan.service';
import moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

@Component({
    templateUrl: './edit.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class EditComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('filterByNama', { static: true }) findNama: ElementRef;
    form: FormGroup;
    types: any[];
    file = null;
    jenisKegiatanList = this._helperService.jenisKegiatanList();
    onFileInputed: boolean = false;
    hideListJFP: boolean = false;

    dataSource = new MatTableDataSource<any>();
    displayedColumns = ['select', 'nama', 'jabatanNama', 'bahasas'];
    length = null;
    pageSize = 10;

    pesertaList: any[] = [];
    selectedPeserta: any[] = [];
    baseUrl = environment.baseUrl;

    jenisJabatan$: Observable<any[]> = this._referensiService.jabatan();
    provinsi$: Observable<any[]> = this._referensiService.provinsi({ q: '' });
    bahasaList: Observable<any> = this._referensiService.jenisBahasa();

    filterbyProvAlamatKantor: any = '';
    filterByBahasa: any = '';

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<EditComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _referensiService: ReferensiService,
        private _kegiatanService: KegiatanService,
        private _toastr: ToastrService,
        private _penerjemahService: PenerjemahService,
    ) { }

    ngOnInit(): void {
        const dateTime = this._data.selected.deadlineKonfirmasi.split(' ', 2);
        this.form = this._formBuilder.group({
            id: [this._data.selected.id],
            jenisKegiatan: [this._data.selected.jenisKegiatan, [Validators.required]],
            judul: [this._data.item.judul, [Validators.required]],
            deskripsi: [this._data.item.deskripsi, [Validators.required]],
            lokasi: [this._data.selected.lokasi, [Validators.required]],
            tglMulai: [this._helperService.getDateFromStringID(this._data.selected.tglMulai), [Validators.required]],
            tglAkhir: [this._helperService.getDateFromStringID(this._data.selected.tglAkhir), [Validators.required]],
            deadlineKonfirmasi: [this._helperService.getDateFromStringID(dateTime[0]), [Validators.required]],
            deadline_time: [dateTime[1], [Validators.required]],
            isForAllJFP: [this._data.selected.isForAllJFP],

            file: [null, Validators.required]
        });
        const peserta = [];
        this._data.selected.undanganDtoList.forEach((element) => {
			peserta.push({id: element.pnsId});
		  });
        this.selectedPeserta = peserta;
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

    create(isPublish): void {
        const formInput = this.form.getRawValue();
        const body = new FormData();
        body.append('id', formInput.id);
        body.append('jenisKegiatan', formInput.jenisKegiatan);
        body.append('judul', formInput.judul);
        body.append('deskripsi', formInput.deskripsi);
        body.append('lokasi', formInput.lokasi);
        body.append('tglMulai', moment(formInput.tglMulai).format('DD-MM-YYYY'));
        body.append('tglAkhir', moment(formInput.tglAkhir).format('DD-MM-YYYY'));
        body.append('deadlineKonfirmasi', moment(formInput.deadlineKonfirmasi).format('DD-MM-YYYY') + ' ' + (formInput.deadline_time).substring(0,2) + ':' + (formInput.deadline_time).substring(3,4) + ':00');
        // body.append('deadline_time', formInput.deadline_time);
        body.append('isConfirmed', isPublish);
        body.append('isForAllJFP', formInput.isForAllJFP);
        body.append('maxPeserta', (formInput.isForAllJFP) ? '0' : (this.selectedPeserta.length).toString());
        if (this.selectedPeserta.length > 0 && formInput.isForAllJFP === false) {
            const pnsIds = [];
            this.selectedPeserta.forEach((item, index) => {
                pnsIds.push(item.id);
                body.append('pnsIds[' + index + ']', item.id);
            });
            // body.append('pnsIds', JSON.stringify(pnsIds.filter((v, i, a) => a.indexOf(v) === i)));
        }
        if (formInput.file) { body.append('file', formInput.file); }

        this._kegiatanService.saveUndangan(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Undangan kegiatan telah di', 'Kegiatan berhasil dibuat');
                    this.form.reset();
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    exists(item) {
        return this.selectedPeserta.find(selected => selected.id === item.id);
    }

    isIndeterminate() {
        return (this.selectedPeserta.length > 0 && !this.isChecked());
    }

    toggle(item, event: MatCheckboxChange) {
        console.log('this.selectedPeserta', item);
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

    onChangeForAllJFP(ob: MatSlideToggleChange) {
        this.hideListJFP = (ob.checked) ? true : false;
        this._changeDetectorRef.detectChanges();
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

    displayFn(item) {
        if (item) { return item.nama; }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
