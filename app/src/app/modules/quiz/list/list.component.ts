/* eslint-disable @typescript-eslint/no-shadow */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from '../create/create.component';
import { ReferensiService } from 'app/services/referensi.service';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { QuizService } from 'app/services/quiz.service';

@Component({
    selector: 'kuisoner-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
    categories: any[];
    items$: Observable<any[]>;
    filtered: any[];
    show;
    groupDiklatList = this._referensiService.groupDiklat();
    topicDiklatList = this._referensiService.groupTopic();
    role: string = this._authService.role;
    filters: any = {
        'filters': {
            'byTitle': null,
            'byStatus': null,
            'byCategoryId': null,
            'byType': null
        }
    };

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _referensiService: ReferensiService,
        private _authService: AuthService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _quizService: QuizService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        private _toastr: ToastrService
    ) {
    }

        ngOnInit(): void {
            this.items$ = this._quizService.items$;
            this.fetch(true);
        }

        ngOnDestroy(): void {
            this._unsubscribeAll.next(null);
            this._unsubscribeAll.complete();
        }

    fetch(isFilter: boolean = true): void {
        this.filters.byType = 'DIKLAT'; 
        if (isFilter) {
            this._quizService.getList(0, 1000, this.filters).pipe(takeUntil(this._unsubscribeAll)).subscribe();
        } else {
            this._quizService.getList().pipe(takeUntil(this._unsubscribeAll)).subscribe();
        }

        this.items$ = this._quizService.items$;
        this._changeDetectorRef.markForCheck();
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
                this.fetch();
            }
        });
    }

    toggleEdit(data): void {
        this._quizService.detail(data.id).subscribe((item: any) => {
            if (item?.success) {
                const dialogRef = this._matDialog.open(CreateComponent, { autoFocus: false, data: item?.mapData?.bucket });
                dialogRef.afterClosed().subscribe((result) => {
                    if (result) {
                        this.fetch();
                    }
                });
            } else {
                this._toastr.error(item?.message);
            }
        });
    }

    toggleClone(data): void {
        const newName = data.name + ' copy';
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Replikasi kelompok soal',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:clipboard-copy',
                'color': 'info'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': 'Konfirm replikasi',
                    'color': 'primary'
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
                this._quizService.clone({
                    id: data.id,
                    name: newName
                }).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Berhasil membuat kelompok soal baru dengan nama `' + newName + '`');
                            this.fetch();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    toggleDelete(id): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus Kelompok Soal',
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
                this._quizService.delete(id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Kelompok soal telah dihapus', 'Hapus Berhasil');
                            this.fetch();
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

        // dialogRef.afterClosed().subscribe((_result) => {
        //     if (_result === 'confirmed') {
        //         const body = new FormData();
        //         body.append('id', item.id);
        //         body.append('status', status);
        //         this._quizService.changeStatus(body).subscribe(
        //             (result) => {
        //                 if (result?.success) {
        //                     this._toastr.success('Status forum berhasil diubah');
        //                     this._quizService.getList().subscribe();
        //                 } else {
        //                     this._toastr.error(result?.message, 'ERROR');
        //                 }
        //             }
        //         );
        //     }
        // });
    }

    filterByQuery(query: string): void {
        this.filters.filters.byTitle = query ?? null;
        this.fetch(true);
    }

    filterByGroup(change: MatSelectChange): void {
        this.filters.byCourseGroupId = change.value === '' ? null : change.value;
        this.fetch(true);
    }

    filterByTopic(change: MatSelectChange): void {
        this.filters.byCourseTopicId = change.value === '' ? null : change.value;
        this.fetch(true);
    }

    filterByType(change: MatSelectChange): void {
        this.filters.byType = change.value === '' ? null : change.value;
        this.fetch(true);
    }

    toggleCompleted(change: MatSlideToggleChange, item): void {
        const status = (change.checked) ? 'PUBLISHED' : 'DRAFT';
        const params = {
            bucketId: item.id,
            status: (change.checked) ? 'PUBLISHED' : 'DRAFT'
        };
        this._quizService.setBucketStatus(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Status soal `' + item.name + '` telah diset ' + status);
                    this.fetch(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                    change.source.checked = !change.checked;
                    this._changeDetectorRef.markForCheck();
                }
            }
        );
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
