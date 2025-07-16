/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Observable, Subject, startWith } from 'rxjs';
import { debounceTime, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ListComponent } from '../list/list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { ReferensiUnitKerjaService } from 'app/services/referensi-unit-kerja.service';
import { HelperService } from 'app/services/helper.service';

@Component({
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent implements OnInit, OnDestroy {
    editMode: boolean = false;
    tagsEditMode: boolean = false;
    form: FormGroup;
    isLoading = false;
    selected: any;
    items: any[];
    resultInstansi: any[];
    resultSatuanOrganisasi: any[];
    filteredInstansi$: Observable<any[]>;
    filteredSatuanOrganisasi$: Observable<any[]>;
    itemUnitKerja$: Observable<any[]>;
    jenisInstansiList = this._referensiService.jenisInstansiList();
    unitKerja$: Observable<any[]> = this._referensiService.unitKerja();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _listComponent: ListComponent,
        private _formBuilder: FormBuilder,
        private _referensiService: ReferensiService,
        public _helperService: HelperService,
        private _referensiUnitKerjaService: ReferensiUnitKerjaService,
        private _router: Router,
        private _toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this._listComponent.matDrawer.open();

        this.form = this._formBuilder.group({
            instansiId: [null],
            satuanOrganisasiId: [null],
            nama: ['', [Validators.required]],
        });

        this._referensiUnitKerjaService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: any[]) => {
                this.items = items;
                this._changeDetectorRef.markForCheck();
            });

        this._referensiUnitKerjaService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((selected: any) => {
                this._listComponent.matDrawer.open();
                this.selected = selected;
        
                // Patch basic data
                this.form.patchValue(selected);
        
                // Prioritaskan satuanOrganisasi, dan pastikan instansi ikut terisi dari dalamnya
                if (selected.satuanOrganisasi) {
                    this.form.controls['instansiId'].setValue(selected.satuanOrganisasi.instansi);
                    this.form.controls['satuanOrganisasiId'].setValue(selected.satuanOrganisasi);
                } else if (selected.instansi) {
                    this.form.controls['instansiId'].setValue(selected.instansi);
                }
        
                this.toggleEditMode(false);
                this._changeDetectorRef.markForCheck();
        });

        this.form.get('instansiId').valueChanges.subscribe(value => {
            if (value) {
                this.form.get('satuanOrganisasiId').patchValue(null, { emitEvent: false });
            }
        });
    
        this.form.get('satuanOrganisasiId').valueChanges.subscribe(value => {
            if (value) {
                const instansi = value.instansi;
                if (instansi && instansi.id) {
                    this.form.get('instansiId').patchValue(instansi, { emitEvent: false });
                }
            } else {
                // Jika satuanOrganisasi dihapus, kosongkan juga instansi
                this.form.get('instansiId').patchValue(null, { emitEvent: false });
            }
        });

        this._referensiService.instansi({ q: '', size: 1000 }).pipe(
            takeUntil(this._unsubscribeAll),
            finalize(() => this.isLoading = false)
        ).subscribe((items: any) => {
            this.resultInstansi = items;
            this._changeDetectorRef.markForCheck();
            console.log('Instansi result:', this.resultInstansi);
        });

        this._referensiService.satuanOrganisasi({}).pipe(
            takeUntil(this._unsubscribeAll),
            finalize(() => this.isLoading = false)
        ).subscribe((items: any) => {
            this.resultSatuanOrganisasi = items;
            this._changeDetectorRef.markForCheck();
            console.log('Satuan Organisasi result:', this.resultSatuanOrganisasi);
        });

        // Autocomplete Instansi
        this.filteredInstansi$ = this.form.get('instansiId')!.valueChanges.pipe(
            startWith(''),
            map(value => {
                const nama = typeof value === 'string' ? value : value?.nama;
                return this._filterInstansi(nama);
            })
        );

        // Autocomplete Satuan Organisasi
        this.filteredSatuanOrganisasi$ = this.form.get('satuanOrganisasiId')!.valueChanges.pipe(
            startWith(''),
            map(value => {
                const nama = typeof value === 'string' ? value : value?.nama;
                return this._filterSatuanOrganisasi(nama);
            })
        );
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._listComponent.matDrawer.close();
    }

    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }
        this._changeDetectorRef.markForCheck();
    }

    update(): void {
        const params: any = this.form.getRawValue();
        params.id = this.selected.id;
        this._referensiUnitKerjaService.save(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Referensi unit kerja berhasil diperbaharui', 'Update berhasil');
                    this.form.reset();
                    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                    this._referensiUnitKerjaService.getList().subscribe();
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    delete(): void {
        const id = this.selected.id;
        const currentIndex = this.items.findIndex(item => item.id === id);
        const nextContactIndex = currentIndex + ((currentIndex === (this.items.length - 1)) ? -1 : 1);
        const nexttId = (this.items.length === 1 && this.items[0].id === id) ? null : this.items[nextContactIndex].id;

        this._referensiUnitKerjaService.delete(id)
            .subscribe((result: any) => {
                if (result?.success) {
                    this._toastr.success('Referensi unit kerja berhasil dihapus', 'Hapus berhasil');
                    if (nexttId) {
                        this._router.navigate(['../', nexttId], { relativeTo: this._activatedRoute });
                    }
                    else {
                        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                    }
                    this.toggleEditMode(false);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            });
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    displaySatuanOrganisasiFn(item: any): string {
        return item ? item.nama : '';
    }

    displayInstansiFn(item: any): string {
        return item ? item.nama : '';
    }

    private _filterInstansi(nama: string): any[] {
        const filterValue = nama?.toLowerCase() || '';
        return this.resultInstansi?.filter(option => option.nama.toLowerCase().includes(filterValue));
    }
    
    private _filterSatuanOrganisasi(nama: string): any[] {
        const filterValue = nama?.toLowerCase() || '';
        return this.resultSatuanOrganisasi?.filter(option => option.nama.toLowerCase().includes(filterValue));
    }
}
