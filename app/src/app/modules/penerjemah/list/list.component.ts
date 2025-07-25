import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, NgModel } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { debounceTime, filter, finalize, fromEvent, map, merge, Observable, Subject, switchMap, takeUntil, tap, combineLatest, of } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Pagination, Pegawai } from '../penerjemah.types';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { ReferensiService } from 'app/services/referensi.service';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { environment } from 'environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from '../create/create.component';
import { CreateComponentAdmin } from '../create_admin/createadmin.component';
import { CreateComponentKepegawaian } from '../create_kepegawaian/createkepegawaian.component';
import { CreateComponentAsesor } from '../create_asesor/createasesor.component';
import { CreateComponentPengajar } from '../create_pengajar/createpengajar.component';


@Component({
    selector: 'penerjemah-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PenerjemahListComponent implements OnInit, OnDestroy {
    @Input() debounce: number = 300;
    @Input() minLength: number = 2;
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    // jfpItems$: Observable<Pegawai[]>; // Original jfpItems$ (will be derived from service, not directly used in template after transformation)
    displayJfpItems$: Observable<any[]>; // New observable for transformed data
    pagination: Pagination;
    isLoading: boolean = false;
    form: FormGroup;
    showPelatihanFilter: boolean = false;
    jenisJabatan$: Observable<any[]> = this._referensiService.jabatan();
    provinsi$: Observable<any[]> = this._referensiService.provinsi({q: ''});
    instansi$: Observable<any[]> = this._referensiService.instansi({q: '', size: 1000});
    bahasaList: Observable<any> = this._referensiService.jenisBahasa();
    pnsId: String;
    filterBahasa: any[] = [];
    filteredYears: number[] = [];
    showButtons = false;
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedItem: Pegawai;
    resultSetsPendidikan: any[] = [];
    baseUrl = environment.baseUrl;
    isPopupOpen = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _penerjemahService: PenerjemahService,
        private _router: Router,
        private _referensiService: ReferensiService,
        private _formBuilder: FormBuilder,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _toastr: ToastrService,
        private _matDialog: MatDialog,
    ) {}

    @ViewChild('barSearchInput')
    set barSearchInput(value: ElementRef) {
        if (value) {
            setTimeout(() => {
                value.nativeElement.focus();
            });
        }
    }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            byProvAlamatKantorList: [[]],
            byNama: [null],
            byJabatanList: [[]],
            byInstansiList: [[]],
            byBahasa: [[]],
            byIsAktif: [null],
            // Add new form controls for the new search criteria
            bynamaPelatihan: [''],
            byTahunPelatihan: [''],
            byPeringkatPelatihan: [''],
            byJp: [''],
            byPredikatPelatihan: [''],
            byPendidikan: [''],
            byNamaSekolahPendidikan: [''],
            byJurusanPendidikan: [''],
            byTahunLulusPendidikan: [''],
            byUjiKompetensi: [''],
        });

        // Subscribe to form value changes
        merge(
            this.form.get('byProvAlamatKantorList').valueChanges,
            this.form.get('byNama').valueChanges,
            this.form.get('byJabatanList').valueChanges,
            this.form.get('byInstansiList').valueChanges,
            this.form.get('byBahasa').valueChanges,
            this.form.get('byIsAktif').valueChanges,
            this.form.get('bynamaPelatihan').valueChanges,
            this.form.get('byTahunPelatihan').valueChanges,
            this.form.get('byPeringkatPelatihan').valueChanges,
            this.form.get('byJp').valueChanges,
            this.form.get('byPredikatPelatihan').valueChanges,
            this.form.get('byPendidikan').valueChanges,
            this.form.get('byNamaSekolahPendidikan').valueChanges,
            this.form.get('byJurusanPendidikan').valueChanges,
            this.form.get('byTahunLulusPendidikan').valueChanges,
            this.form.get('byUjiKompetensi').valueChanges
        ).pipe(
            debounceTime(300),
            takeUntil(this._unsubscribeAll)
        ).subscribe(() => {
            this.fetch(0, this.pagination.perPage, this.form.getRawValue()).subscribe();
        });

        // Muat data saat komponen dimulai
        this.fetch(0, 10, this.form.getRawValue()).subscribe();

        // Combine jfpItems$ from service with provinsi$ to enrich data
        this.displayJfpItems$ = combineLatest([
            this._penerjemahService.jfpItems$,
            this.provinsi$,
            this.instansi$
        ]).pipe(
            map(([jfpItems, provinsiList, instansiList]) => {
                return jfpItems.map(item => {
                    const province = provinsiList.find(prov => prov.id === item.provinsi);
                    const instansi = instansiList.find(inst => inst.id === item.instansiId);
                    return {
                        ...item,
                        provinsiNama: province ? province.nama : '-',
                        instansiNama: instansi ? instansi.nama : '-'
                    };
                });
            }),
            tap((data) => {
                console.log('Transformed jfpItems$ diterima: ', data);
            }),
            takeUntil(this._unsubscribeAll)
        );

        // Removed original subscription to jfpItems$ as it's now transformed into displayJfpItems$
        // this.jfpItems$.pipe(
        //     tap((data) => {
        //         console.log('Data jfpItems$ diterima: ', data);
        //     })
        // ).subscribe();

        this._penerjemahService.jfpItem$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                if (item) {
                    this.selectedItem = item;
                    this._changeDetectorRef.markForCheck();
                }
            });

        this._penerjemahService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                this.selectedItem = null;
                this._changeDetectorRef.markForCheck();
            }
        });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                } else {
                    this.drawerMode = 'over';
                }
                this._changeDetectorRef.markForCheck();
            });
    }
toggleFilterVisibility(): void {
        this.showPelatihanFilter = !this.showPelatihanFilter;
    }
    pageEvent(event: MatPaginator) {
        this.fetch(event.pageIndex, event.pageSize, this.form.getRawValue()).subscribe();
    }
 toggleButtons() {
    this.showButtons = !this.showButtons; // Mengubah status tampilan tombol
  }
    create(): void {
        const dialogRef = this._matDialog.open(CreateComponent, { autoFocus: false });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.fetch((this.pagination.draw), this.pagination.perPage, this.form.getRawValue()).subscribe();
            }
        });
    }
    createadmin(): void {
        const dialogRef = this._matDialog.open(CreateComponentAdmin, { autoFocus: false });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.fetch((this.pagination.draw), this.pagination.perPage, this.form.getRawValue()).subscribe();
            }
        });
    }
    createkepegawaian(): void {
        const dialogRef = this._matDialog.open(CreateComponentKepegawaian, { autoFocus: false });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.fetch((this.pagination.draw), this.pagination.perPage, this.form.getRawValue()).subscribe();
            }
        });
    }
    createasesor(): void {
        const dialogRef = this._matDialog.open(CreateComponentAsesor, { autoFocus: false });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.fetch((this.pagination.draw), this.pagination.perPage, this.form.getRawValue()).subscribe();
            }
        });
    }
    createpengajar(): void {
        const dialogRef = this._matDialog.open(CreateComponentPengajar, { autoFocus: false });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.fetch((this.pagination.draw), this.pagination.perPage, this.form.getRawValue()).subscribe();
            }
        });
    }
onYearInput(event: any): void {
    const inputValue = event.target.value;

    // Cek apakah input mengandung "-"
    if (inputValue.includes('-')) {
        const [startYear, endYear] = inputValue.split('-').map(year => parseInt(year.trim(), 10));

        // Validasi input tahun
        if (!isNaN(startYear) && !isNaN(endYear) && startYear <= endYear) {
            this.filteredYears = [];
            for (let year = startYear; year <= endYear; year++) {
                this.filteredYears.push(year);
            }
        } else {
            this.filteredYears = [];
        }
    } else {
        // Jika input tidak memiliki "-" atau tahun tunggal, reset
        this.filteredYears = [];
    }
}

    fetch(page: number = 0, size: number = 10, search: any = {}) {
        // Convert search criteria to the appropriate format
        if (search.byBahasa.length > 0) {
            search.byBahasa = search.byBahasa.map((bahasa: any) => bahasa.id);
        } else {
            search.byBahasa = null;
        }

        if (search.byInstansiList.length > 0) {
            search.byInstansiList = search.byInstansiList.map((instansi: any) => instansi.id);
        } else {
            search.byInstansiList = null;
        }

        if (search.byJabatanList.length > 0) {
            search.byJabatanList = search.byJabatanList.map((jabatan: any) => jabatan.id);
        } else {
            search.byJabatanList = null;
        }

        if (search.byProvAlamatKantorList.length > 0) {
            search.byProvAlamatKantorList = search.byProvAlamatKantorList.map((provinsi: any) => provinsi.id);
        } else {
            search.byProvAlamatKantorList = null;
        }

        // Handle new search criteria
        // search.byProvAlamatKantor = search.byProvAlamatKantor || null;
        search.byNama = search.byNama || null;
        // search.byJabatan = search.byJabatan || null;
        // search.byInstansi = search.byInstansi || null;  // Add processing for instansi parameter
        search.byIsAktif = search.byIsAktif !== null ? search.byIsAktif : null; 
        search.bynamaPelatihan = search.bynamaPelatihan || null;
        search.byTahunPelatihan = search.byTahunPelatihan || null;
        search.byPeringkatPelatihan = search.byPeringkatPelatihan || null;
        search.byJp = search.byJp || null;
        search.byPredikatPelatihan = search.byPredikatPelatihan || null;
        search.byPendidikan = search.byPendidikan || null;
        search.byNamaSekolahPendidikan = search.byNamaSekolahPendidikan || null;
        search.byJurusanPendidikan = search.byJurusanPendidikan || null;
        search.byTahunLulusPendidikan = search.byTahunLulusPendidikan || null;
        search.byUjiKompetensi = search.byUjiKompetensi || null;

        console.log('Search params:', search);  // Add logging to debug search parameters

        return this._penerjemahService.getJfp(+page, +size, 'nama', 'ASC', search).pipe();
    }

    toggleSearch() {
        this.fetch((this.pagination.draw), this.pagination.perPage, this.form.getRawValue()).subscribe();
    }

    togglePrint() {
        const params = { ...this.form.getRawValue() };

        // Transform lists of objects to lists of IDs
        if (params.byBahasa && params.byBahasa.length > 0) {
            params.byBahasa = params.byBahasa.map((bahasa: any) => bahasa.id);
        } else {
            params.byBahasa = null;
        }

        if (params.byInstansiList && params.byInstansiList.length > 0) {
            params.byInstansiList = params.byInstansiList.map((instansi: any) => instansi.id);
        } else {
            params.byInstansiList = null;
        }

        if (params.byJabatanList && params.byJabatanList.length > 0) {
            params.byJabatanList = params.byJabatanList.map((jabatan: any) => jabatan.id);
        } else {
            params.byJabatanList = null;
        }

        if (params.byProvAlamatKantorList && params.byProvAlamatKantorList.length > 0) {
            params.byProvAlamatKantorList = params.byProvAlamatKantorList.map((provinsi: any) => provinsi.id);
        } else {
            params.byProvAlamatKantorList = null;
        }

        // Ensure other fields are correctly handled (e.g., set to null if empty string)
        params.byNama = params.byNama || null;
        params.byIsAktif = params.byIsAktif !== null ? params.byIsAktif : null;
        params.bynamaPelatihan = params.bynamaPelatihan || null;
        params.byTahunPelatihan = params.byTahunPelatihan || null;
        params.byPeringkatPelatihan = params.byPeringkatPelatihan || null;
        params.byJp = params.byJp || null;
        params.byPredikatPelatihan = params.byPredikatPelatihan || null;
        params.byPendidikan = params.byPendidikan || null;
        params.byNamaSekolahPendidikan = params.byNamaSekolahPendidikan || null;
        params.byJurusanPendidikan = params.byJurusanPendidikan || null;
        params.byTahunLulusPendidikan = params.byTahunLulusPendidikan || null;
        params.byUjiKompetensi = params.byUjiKompetensi || null;

        // Add sortBy and sort to the parameters for printing
        params.sortBy = 'nama';
        params.sort = 'ASC';

        // Add visible columns to the parameters
        params.columnsToPrint = Object.keys(this.displayedColumns).filter(key => this.displayedColumns[key]);

        this._penerjemahService.cetak(params).subscribe(
            (result) => {
                const fileURL = URL.createObjectURL(result);
                const a = document.createElement('a');
                a.href = fileURL;
                a.download = 'daftar-jfp.xlsx'; // ✅ nama file di sini
                a.click();
                URL.revokeObjectURL(fileURL);
            }, 
            (error) => {
                this._toastr.error('ERROR: cetak gagal', error);
            }
        );
    }

    displayFn(item) {
        if (item) { return item.nama; }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }
    displayedColumns: { [key: string]: boolean } = {
        foto: true,
        nama: true,
        instansi: true,
        provAlamatKantor: true,
        jabatan: true,
        isAktif: true,
        bahasa: true,
        pelatihan: true,
        ujiKompetensi: true,
        angkaKredit: true,
        pendidikan: true
    };
    
    columnList = [
        { id: 'foto', label: 'Foto' },
        { id: 'nama', label: 'Nama' },
        { id: 'instansi', label: 'Instansi' },
        { id: 'provAlamatKantor', label: 'Provinsi' },
        { id: 'jabatan', label: 'Jabatan' },
        { id: 'isAktif', label: 'Status Akun' },
        { id: 'bahasa', label: 'Bahasa' },
        { id: 'pelatihan', label: 'Pelatihan' },
        { id: 'angkaKredit', label: 'Angka Kredit' },
        { id: 'pendidikan', label: 'Pendidikan' },
        { id: 'ujiKompetensi', label: 'Uji Kompetensi' },
    ];
    
    toggleColumn(columnId: string): void {
        this.displayedColumns[columnId] = !this.displayedColumns[columnId];
        this._changeDetectorRef.markForCheck();
    }
    
    toggleAllColumns(checked: boolean): void {
        Object.keys(this.displayedColumns).forEach(key => {
            this.displayedColumns[key] = checked;
        });
        this._changeDetectorRef.markForCheck();
    }

    isPendidikanFilterFilled(): boolean {
        const f = this.form;
        return f.get('byNamaSekolahPendidikan')?.value ||
               f.get('byTahunLulusPendidikan')?.value ||
               f.get('byPendidikan')?.value ||
               f.get('byJurusanPendidikan')?.value;
      }

    isUjiKompetensiFilterFilled(): boolean {
        const f = this.form;
        return f.get('byUjiKompetensi')?.value;
    }

    isPelatihanFilterFilled(): boolean {
        const f = this.form;
        return f.get('bynamaPelatihan')?.value ||
               f.get('byTahunPelatihan')?.value ||
               f.get('byPeringkatPelatihan')?.value ||
               f.get('byPredikatPelatihan')?.value;
      }
    
}