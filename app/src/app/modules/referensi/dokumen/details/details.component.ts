/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListComponent } from '../list/list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { ReferensiPendidikanService } from 'app/services/referensi-pendidikan.service';
import { ReferensiDokumenService } from 'app/services/referensi-dokumen.service';

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
    onFileInputed: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _listComponent: ListComponent,
        private _formBuilder: FormBuilder,
        private _referensiService: ReferensiService,
        private _referensiDokumenService: ReferensiDokumenService,
        private _router: Router,
        private _toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this._listComponent.matDrawer.open();

        this.form = this._formBuilder.group({
            id: [''],
            tkPendidikan: ['', [Validators.required]],
            nama: ['', [Validators.required]],
        });

        this._referensiDokumenService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((items: any[]) => {
                this.items = items;
                this._changeDetectorRef.markForCheck();
            });

        this._referensiDokumenService.item$
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

    update(): void {
        const params: any = this.form.getRawValue();
        params.id = this.selected.id;
        this._referensiDokumenService.save(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Referensi pendidikan berhasil diperbaharui', 'Update berhasil');
                    this.form.reset();
                    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                    this._referensiDokumenService.getList().subscribe();
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

        this._referensiDokumenService.delete(id)
            .subscribe((result: any) => {
                if (result?.success) {
                    this._toastr.success('Referensi pendidikan berhasil dihapus', 'Hapus berhasil');
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
