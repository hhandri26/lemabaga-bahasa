import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Observable, of, Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { UserService } from 'app/services/user.service';
import { MatPaginator } from '@angular/material/paginator';
import { Pagination } from 'app/modules/penerjemah/penerjemah.types';
import { ReferensiService } from 'app/services/referensi.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from '../create/create.component';
import * as XLSX from 'xlsx';
import { take } from 'rxjs/operators';

@Component({
    selector: 'users-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    items$: Observable<any[]>;
    pagination: Pagination;
    isLoading: boolean = false;

    form: FormGroup;
    total: number = 0;
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selected: any;
    roles$: Observable<any[]> = this._referensiService.roles();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _userService: UserService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _referensiService: ReferensiService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _matDialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            byRole: [''],
            byName: [''],
            byKategori: ['']
        });

        this.items$ = this._userService.items$;

        this._userService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.selected = user;
                this._changeDetectorRef.markForCheck();
            });

        this._userService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        // Trigger search on value change
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap(query => {
                    // Only call fetch if there's a query
                    return this.fetch(0, 10, { byName: query || null });
                })
            )
            .subscribe();

        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                this.selected = null;
                this._changeDetectorRef.markForCheck();
            }
        });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                this.drawerMode = matchingAliases.includes('lg') ? 'side' : 'over';
                this._changeDetectorRef.markForCheck();
            });

        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(event =>
                    (event.ctrlKey === true || event.metaKey) && (event.key === '/')
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
        this.fetch(event.pageIndex, event.pageSize, this.form.getRawValue()).subscribe();
    }

    fetch(page: number = 0, size: number = 10, search: any = {}) {
        if (!search.byRole) { search.byRole = null; }
        if (!search.byName) { search.byName = null; }
        if (!search.byKategori) { search.byKategori = null; }

        return this._userService.getList(+page, +size, 'name', 'ASC', search).pipe();
    }

    toggleSearch() {
        this.fetch((this.pagination.draw), this.pagination.perPage, this.form.getRawValue()).subscribe();
    }

    onBackdropClicked(): void {
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._changeDetectorRef.markForCheck();
    }

    create(): void {
        const dialogRef = this._matDialog.open(CreateComponent, { autoFocus: false });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._userService.getList().subscribe();
            }
        });
    }

    trackByFn(index: number, item: any): any {
        return item?.id || index;
    }

    exportToExcel() {
        this.items$.pipe(take(1)).subscribe(users => {
            console.log(users);
            if (users && users.length) {
                const data = users.map(user => ({
                    Nama: user.nama,
                    Role: user.roles[0] === 'ROLE_USER' ? 'Role Penerjemah' :
                          user.roles[0] === 'ROLE_ADMIN_KEPEGAWAIAN_INSTANSI' ? 'Role Kepegawaian' :
                          user.roles[0] === 'ROLE_PEMBINA_JFP' ? 'Role Pengajar' :
                          user.roles[0] === 'ROLE_INSTRUKTUR' ? 'Role Asesor' :
                          user.roles[0].replace('_', ' ').toLowerCase(),
                    Kategori: user.kategori ? user.kategori.charAt(0).toUpperCase() + user.kategori.slice(1).replace('_', ' ') : ' - ',
                    Nip: user.nip,
                    Email: user.email,
                    Instansi: user.namaInstansi,
                    'Satuan Organisasi': user.satuanorganisasi,
                    'Unit Kerja': user.unitkerja,
                    Jabatan: user.jabatanNama,
                }));

                const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
                const headerCells = Object.keys(data[0]);
                headerCells.forEach((cell, index) => {
                    worksheet[XLSX.utils.encode_cell({ r: 0, c: index })].s = {
                        font: { bold: true }
                    };
                });

                const colWidths = headerCells.map(() => ({ wpx: 150 }));
                worksheet['!cols'] = colWidths;

                const workbook: XLSX.WorkBook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Pengguna');

                const filename = `Daftar_Pengguna_${new Date().toLocaleDateString()}.xlsx`;
                XLSX.writeFile(workbook, filename);
            } else {
                alert('Tidak ada data pengguna untuk diekspor!');
            }
        });
    }
}
