/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable max-len */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Observable, Subject } from 'rxjs';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatPaginator } from '@angular/material/paginator';
import { Pagination } from 'app/modules/penerjemah/penerjemah.types';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from '../create/create.component';
import { ReferensiSatuanOrganisasiService } from 'app/services/referensi-satuan-organisasi.service';
import { ReferensiService } from 'app/services/referensi.service';
import { HelperService } from 'app/services/helper.service';

@Component({
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    items$: Observable<any[]>;
    pagination: Pagination;
    isLoading: boolean = false;
    perPage: number;
    draw: number;
    drawerMode: 'side' | 'over';
    resultInstansi: any[];
    selected: any;
    form: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _referensiSatuanOrganisasiService: ReferensiSatuanOrganisasiService,
        private _referensiService: ReferensiService,
        public _helperService: HelperService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _matDialog: MatDialog,
        private _formBuilder: UntypedFormBuilder,
    ) {
    }

    ngOnInit(): void {

        this.items$ = this._referensiSatuanOrganisasiService.items$;

        this._referensiSatuanOrganisasiService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.selected = user;
                this._changeDetectorRef.markForCheck();
            });

        this._referensiSatuanOrganisasiService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this.form = this._formBuilder.group({
            instansiId: [null],
        });

        this._referensiService.instansi({ q: '', size: 1000 }).pipe(
            takeUntil(this._unsubscribeAll),
            finalize(() => this.isLoading = false)
        ).subscribe((items: any) => {
            this.resultInstansi = items;
            this._changeDetectorRef.markForCheck();
            console.log('Instansi result:', this.resultInstansi);
        });

        // fromEvent(this.findKeyword.nativeElement, 'keyup')
        //     .pipe(
        //         takeUntil(this._unsubscribeAll),
        //         debounceTime(150),
        //         distinctUntilChanged(),
        //         tap(() => {
        //             this.pagination.draw = 0;
        //             this._changeDetectorRef.markForCheck();
        //             this._referensiSatuanOrganisasiService.getList({ q: (this.findKeyword.nativeElement.value) ? this.findKeyword.nativeElement.value : '' }, this.draw, this.perPage).subscribe();
        //         })
        //     )
        //     .subscribe();

        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                this.selected = null;
                this._changeDetectorRef.markForCheck();
            }
        });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                }
                else {
                    this.drawerMode = 'over';
                }
                this._changeDetectorRef.markForCheck();
            });

        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(event =>
                    (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                    && (event.key === '/') // '/'
                )
            )
            .subscribe(() => {
                this.create();
            });
    }

    find(){
        const params: any = {};
        if(this.form.get('instansiId').value){
            params.instansiId = this.form.get('instansiId').value.id;
        }
        this._referensiSatuanOrganisasiService.getList(params, this.draw, this.perPage).subscribe();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    pageEvent(event: MatPaginator) {
        this.perPage = event.pageSize;
        this.draw = event.pageIndex;
        this._changeDetectorRef.markForCheck();
        this.fetch(event.pageIndex, event.pageSize).subscribe();
    }

    fetch(pageIndex, pageSize) {
        const params: any = {};
        if(this.form.get('instansiId').value){
            params.instansiId = this.form.get('instansiId').value.id;
        }
        return this._referensiSatuanOrganisasiService.getList(params, pageIndex, pageSize).pipe();
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    create(): void {
        const dialogRef = this._matDialog.open(CreateComponent, { autoFocus: false });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._referensiSatuanOrganisasiService.getList().subscribe();
            }
        });
    }

    trackByFn(index: number, item: any): any {
        return item?.id || index;
    }
}
