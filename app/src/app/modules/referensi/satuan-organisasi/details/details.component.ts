/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Observable, Subject } from 'rxjs';
import { debounceTime, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ListComponent } from '../list/list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { ReferensiSatuanOrganisasiService } from 'app/services/referensi-satuan-organisasi.service';
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
    // resultSatuanKerja: any[];
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
        private _referensiSatuanOrganisasiService: ReferensiSatuanOrganisasiService,
        private _router: Router,
        private _toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this._listComponent.matDrawer.open();

        this.form = this._formBuilder.group({
            id: [''],
            instansiId: ['', [Validators.required, this._helperService.requireMatch]],
            nama: ['', [Validators.required]],
        });

        this._referensiSatuanOrganisasiService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: any[]) => {
                this.items = items;
                this._changeDetectorRef.markForCheck();
            });

        this._referensiSatuanOrganisasiService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((selected: any) => {
                this._listComponent.matDrawer.open();
                this.selected = selected;
                this.itemUnitKerja$ = this._referensiSatuanOrganisasiService.itemUnitKerja$;
                this.form.patchValue(selected);
                this.form.controls['instansiId'].setValue(selected.instansi);
                this.toggleEditMode(false);
                this._changeDetectorRef.markForCheck();
            });

        this.form.get('instansiId').valueChanges
            .pipe(
                debounceTime(300),
                takeUntil(this._unsubscribeAll),
                tap(() => this.isLoading = true),
                map((value) => {
                    if (!value || value.length < 2) {
                        this.resultInstansi = null;
                    }
                    return value;
                }),
                filter(value => value && value.length >= 2),
                switchMap(value => this._referensiService.instansi({ q: value }).pipe(
                    finalize(() => this.isLoading = false),
                ))
            ).subscribe((items: any) => {
                this.resultInstansi = items?.content;
                this._changeDetectorRef.markForCheck();
            });
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
        this._referensiSatuanOrganisasiService.save(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Referensi satuan organisasi berhasil diperbaharui', 'Update berhasil');
                    this.form.reset();
                    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                    this._referensiSatuanOrganisasiService.getList().subscribe();
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

        this._referensiSatuanOrganisasiService.delete(id)
            .subscribe((result: any) => {
                if (result?.success) {
                    this._toastr.success('Referensi satuan organisasi berhasil dihapus', 'Hapus berhasil');
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

    displayInstansiFn(item: { nama: string; jenis: string }) {
        if (item) { return item.nama; }
    }
}
