/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ToastrService } from 'ngx-toastr';
import { ReferensiService } from 'app/services/referensi.service';
import { ProfilService } from 'app/services/profil.service';
import { MatDialog } from '@angular/material/dialog';
import { RiilComponent } from '../riil/riil.component';
import { UsulanComponent } from '../usulan/usulan.component';
import { ApprovedComponent } from '../approved/approved.component';
import { FormasiService } from 'app/services/formasi.service';

@Component({
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FORMATS }
    ]
})
export class ListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    items$: Observable<any[]>;
    isLoading: boolean = false;
    pagination: any;
    // searchInputControl: FormControl = new FormControl();
    selected: any | null = null;
    form: FormGroup;
    message = null;
    jenisUsulan = this._referensiService.jenisUsulan();
    actionUsulan = this._referensiService.actionUsulan();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formasiService: FormasiService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toastr: ToastrService,
        private _formBuilder: FormBuilder,
        private _referensiService: ReferensiService,
        private _profilService: ProfilService,
        private _matDialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        // this.form = this._formBuilder.group({
        //     byJenisUsul: [''],
        //     byNama: [null]
        // });

        this._formasiService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: any) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this.items$ = this._formasiService.items$;

        this._formasiService.items$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe();

        this._formasiService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: any) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    pageEvent(event: MatPaginator) {
        this.fetch(event.pageIndex, event.pageSize, this.form.getRawValue()).subscribe();
    }

    toggleSearch() {
        this.fetch((this.pagination.draw), this.pagination.perPage, this.form.getRawValue()).subscribe();
    }

    fetch(page: number = 0, size: number = 10, search: any = {}) {
        if (!search.byJenisUsul) { search.byJenisUsul = null; }
        return this._formasiService.getRekap(+page, +size).pipe();
    }

    toggleRiil(data): void {
        this._formasiService.getRekapExists({instansiId: data.id.instansiId, jabatanId: data.id.jabatanId}).pipe(takeUntil(this._unsubscribeAll)).subscribe((items) => {
            console.log(items);
            data.items = items;
            const dialogRef = this._matDialog.open(RiilComponent, { autoFocus: false, data});
            dialogRef.afterClosed().subscribe((result) => {
                // if (result) {
                //     this._referensiInstansiService.getList().subscribe();
                // }
            });
        });
    }

    toggleUsulan(data): void {
        this._formasiService.getRekapExists({instansiId: data.id.instansiId, jabatanId: data.id.jabatanId}).pipe(takeUntil(this._unsubscribeAll)).subscribe((items) => {
            console.log(items);
            data.items = items;
            const dialogRef = this._matDialog.open(UsulanComponent, { autoFocus: false, data});
            dialogRef.afterClosed().subscribe((result) => {
                // if (result) {
                //     this._referensiInstansiService.getList().subscribe();
                // }
            });
        });
    }

    toggleApproved(data): void {
        this._formasiService.getRekapExists({instansiId: data.id.instansiId, jabatanId: data.id.jabatanId}).pipe(takeUntil(this._unsubscribeAll)).subscribe((items) => {
            console.log(items);
            data.items = items;
            const dialogRef = this._matDialog.open(ApprovedComponent, { autoFocus: false, data});
            dialogRef.afterClosed().subscribe((result) => {
                // if (result) {
                //     this._referensiInstansiService.getList().subscribe();
                // }
            });
        });
    }

    togglePrint(dokumenId) {
		this._profilService.preview(dokumenId).subscribe((blob: any) => {
			const fileURL = URL.createObjectURL(blob);
			window.open(fileURL, '_blank');
		});
    }

    trackByFn(index: number, item: any): any {
        return String(item.id) || String(index);
    }

    trackByFnType(index: number, item: any): any {
        return item.id || index;
    }
}
