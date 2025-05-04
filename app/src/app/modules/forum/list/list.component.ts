/* eslint-disable @typescript-eslint/no-shadow */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, combineLatest, Observable, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from '../create/create.component';
import { ReferensiService } from 'app/services/referensi.service';
import { ForumService } from 'app/services/forum.service';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'diklat-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
    categories: any[];
    items$: Observable<any[]>;
    filtered: any[];
    show;
    jenisForumList = this._referensiService.jenisForum();
    role: string = this._authService.role;
    filters: any = {
        'filters' : {
            'byTitle' : null,
            'byStatus' : null,
            'byCategoryId' : null,
            'byType' : null
        }
    };

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _referensiService: ReferensiService,
        private _authService: AuthService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _forumService: ForumService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        private _toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.items$ = this._forumService.items$;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    getFilePath(file): any {
        if (file !== null) {
            return environment.baseUrl + file;
        } else {
            return './assets/images/cards/01-320x200.jpg';
        }
    }

    toggleShowMode(show: boolean | null = null): void {
        if (show === null) {
            this.show = !this.show;
        } else {
            this.show = show;
        }
        this._changeDetectorRef.markForCheck();
    }

    toggleCreate(): void {
        const dialogRef = this._matDialog.open(CreateComponent, { autoFocus: false });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this._forumService.getList().subscribe();
            }
        });
    }

    toggleEdit(data): void {
        this._forumService.detail(data.id).subscribe((data: any) => {
            const dialogRef = this._matDialog.open(CreateComponent, { autoFocus: false, data });
            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    this._forumService.getList().subscribe();
                }
            });
        });
    }

    toggleDelete(id): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus Forum',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:x',
                'color': 'warn'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': 'Konfirm hapus',
                    'color': 'warn'
                },
                'cancel': {
                    'show': true,
                    'label': 'Batal'
                }
            },
            'dismissible': true
        });

        dialogRef.afterClosed().subscribe((_result) => {
            if (_result === 'confirmed') {
                this._forumService.delete(id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Forum telah dihapus');
                            this._forumService.getList().subscribe();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    toggleStatus(item, status): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': (status === 'PUBLISHED') ? 'Membuka Diskusi' : 'Menutup Diskusi',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:x',
                'color': 'warn'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': (status === 'PUBLISHED') ? 'Konfirm buka' : 'Konfirm tutup',
                    'color': 'warn'
                },
                'cancel': {
                    'show': true,
                    'label': 'Batal'
                }
            },
            'dismissible': true
        });

        dialogRef.afterClosed().subscribe((_result) => {
            if (_result === 'confirmed') {
                const body = new FormData();
                body.append('id', item.id);
                body.append('status', status);
                this._forumService.changeStatus(body).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Status forum berhasil diubah');
                            this._forumService.getList().subscribe();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    filterByQuery(query: string): void {
        console.log(query);
        this.filters.filters.byTitle = query ?? null;
        this._forumService.getList(0, 1000, this.filters).subscribe();
    }

    filterByCategory(change: MatSelectChange): void {
        this.filters.filters.byCategoryId = change.value === '' ? null : change.value;
        this._forumService.getList(0, 1000, this.filters).subscribe();
    }

    filterByStatus(change: MatSelectChange): void {
        this.filters.filters.byStatus = change.value === '' ? null : change.value;
        this._forumService.getList(0, 1000, this.filters).subscribe();
    }

    toggleCompleted(change: MatSlideToggleChange): void {
        // this.filters.hideCompleted$.next(change.checked);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
