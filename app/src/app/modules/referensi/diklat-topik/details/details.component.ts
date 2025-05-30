/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListComponent } from '../list/list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReferensiJenisSertifikatService } from 'app/services/referensi-jenis-sertifikat.service';
import { ReferensiDiklatTopikService } from 'app/services/referensi-diklat-topik.service';
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
    selected: any;
    items: any[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _listComponent: ListComponent,
        private _formBuilder: FormBuilder,
        private _referensiDiklatTopikService: ReferensiDiklatTopikService,
        private _router: Router,
        private _toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this._listComponent.matDrawer.open();

        this.form = this._formBuilder.group({
            id: [''],
            nama: ['', [Validators.required]],
        });

        this._referensiDiklatTopikService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: any[]) => {
                this.items = items;
                this._changeDetectorRef.markForCheck();
            });

        this._referensiDiklatTopikService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((selected: any) => {
                this._listComponent.matDrawer.open();
                this.selected = selected;
                this.form.patchValue(selected);
                this.toggleEditMode(false);
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
        this._referensiDiklatTopikService.save(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Referensi topik diklat berhasil diperbaharui', 'Update berhasil');
                    this.form.reset();
                    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                    this._referensiDiklatTopikService.getList().subscribe();
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

        this._referensiDiklatTopikService.delete(id)
            .subscribe((result: any) => {
                if (result?.success) {
                    this._toastr.success('Referensi topik diklat berhasil dihapus', 'Hapus berhasil');
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
