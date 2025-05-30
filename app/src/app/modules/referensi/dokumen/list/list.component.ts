/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable max-len */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { MatPaginator } from '@angular/material/paginator';
import { Pagination } from 'app/modules/penerjemah/penerjemah.types';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from '../create/create.component';
import { ReferensiDokumenService } from 'app/services/referensi-dokumen.service';

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
    searchInputControl: FormControl = new FormControl();
    selected: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _referensiDokumenService: ReferensiDokumenService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _matDialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
        this.items$ = this._referensiDokumenService.items$;

        this._referensiDokumenService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.selected = user;
                this._changeDetectorRef.markForCheck();
            });

        this._referensiDokumenService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

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
        return this._referensiDokumenService.getList(pageIndex, pageSize).pipe();
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    create(): void {
        const dialogRef = this._matDialog.open(CreateComponent, { autoFocus: false });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._referensiDokumenService.getList().subscribe();
            }
        });
    }

    trackByFn(index: number, item: any): any {
        return item?.id || index;
    }
}
