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
import { ReferensiUnitKerjaService } from 'app/services/referensi-unit-kerja.service';
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
    resultSatuanOrganisasi: any[];
    selected: any;
    form: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _referensiUnitKerjaService: ReferensiUnitKerjaService,
        private _referensiService: ReferensiService,
        public _helperService: HelperService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _matDialog: MatDialog,
        private _formBuilder: UntypedFormBuilder,
    ) {
    }

    ngOnInit(): void {

        this.items$ = this._referensiUnitKerjaService.items$;
        console.log('Items Unit Kerja:', this.items$);

        this._referensiUnitKerjaService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.selected = user;
                this._changeDetectorRef.markForCheck();
            });

        this._referensiUnitKerjaService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        this.form = this._formBuilder.group({
            instansiId: [null],
            satuanOrganisasiId: [null],
        });

        this.form.get('instansiId').valueChanges.subscribe(value => {
            if (value) {
                // Jika memilih instansi langsung, kosongkan satuan organisasi
                this.form.get('satuanOrganisasiId').patchValue(null, { emitEvent: false });
            }
        });
        
        this.form.get('satuanOrganisasiId').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(value => {
                if (value) {
                    // Cari object lengkap satuanOrganisasi dari result
                    const selectedSatuanOrganisasi = this.resultSatuanOrganisasi.find(item => item.id === value.id);
                    const instansi = selectedSatuanOrganisasi?.instansi;

                    if (instansi && instansi.id) {
                        // Cocokkan instansi dari list supaya referensi sama
                        const matchedInstansi = this.resultInstansi.find(i => i.id === instansi.id);
                        if (matchedInstansi) {
                            this.form.get('instansiId').patchValue(matchedInstansi, { emitEvent: false });
                        }
                    }
                } else {
                    // Jika satuanOrganisasi dikosongkan, instansi juga dikosongkan
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

        // fromEvent(this.findKeyword.nativeElement, 'keyup')
        //     .pipe(
        //         takeUntil(this._unsubscribeAll),
        //         debounceTime(150),
        //         distinctUntilChanged(),
        //         tap(() => {
        //             this.pagination.draw = 0;
        //             this._changeDetectorRef.markForCheck();
        //             this._referensiUnitKerjaService.getList({ q: (this.findKeyword.nativeElement.value) ? this.findKeyword.nativeElement.value : '' }, this.draw, this.perPage).subscribe();
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
        if(this.form.get('satuanOrganisasiId').value){
            params.satuanOrganisasiId = this.form.get('satuanOrganisasiId').value.id;
        }
        this._referensiUnitKerjaService.getList(params, this.draw, this.perPage).subscribe();
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
        if(this.form.get('satuanOrganisasiId').value){
            params.satuanOrganisasiId = this.form.get('satuanOrganisasiId').value.id;
        }
        return this._referensiUnitKerjaService.getList(params, pageIndex, pageSize).pipe();
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    create(): void {
        const dialogRef = this._matDialog.open(CreateComponent, { autoFocus: false });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._referensiUnitKerjaService.getList().subscribe();
            }
        });
    }

    trackByFn(index: number, item: any): any {
        return item?.id || index;
    }
}
