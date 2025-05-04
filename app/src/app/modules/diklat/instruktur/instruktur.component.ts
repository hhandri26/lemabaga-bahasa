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
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/services/user.service';
import { DiklatService } from 'app/services/diklat.service';

@Component({
    templateUrl: './instruktur.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class InstrukturComponent implements OnInit, OnDestroy, AfterViewInit {
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
    displayedColumns = ['select', 'nama', 'jabatanNama'];
    length = null;
    pageSize = 10;
    pesertaList: any[] = [];
    selectedPeserta: any[] = [];
    filterbyProvAlamatKantor: any = '';
    filterByBahasa: any = '';


    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<InstrukturComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        private _diklatService: DiklatService
    ) { }

    ngOnInit(): void {
        console.log(this._data);
        this.form = this._formBuilder.group({
            courseId: [this._data?.id, [Validators.required]],
            instructureId: [0, [Validators.required, Validators.min(1)]]
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

    fetch() {
        const search: any = {
            'byRole' : 'ROLE_INSTRUKTUR',
            'byName' : this.findNama.nativeElement.value
        };
        return this._userService.getList(0, 1000, null, null, search).pipe(
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

    filter() {
        this.fetch().subscribe((items: any) => {
            if (items?.content) {
                this.pesertaList = items.content;
                this.dataSource = new MatTableDataSource(items.content);
                this.dataSource.paginator = this.paginator;
                this.length = items.totalElements;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    toggle(item) {
        this.form.get('instructureId').setValue(item.id);
    }

    create(): void {
        const formInput = this.form.getRawValue();
        // const body = new FormData();
        // body.append('courseId', formInput.courseId);
        // body.append('instructureId', formInput.instructureId);

        this._diklatService.assignInstruktur(JSON.stringify(formInput)).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Instruktur berhasil ditambahkan');
                    this.form.reset();
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
