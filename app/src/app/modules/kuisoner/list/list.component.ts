    /* eslint-disable @typescript-eslint/no-shadow */
    import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
    import { Observable, Subject, takeUntil } from 'rxjs';
    import { AuthService } from 'app/core/auth/auth.service';
    import { FuseConfirmationService } from '@fuse/services/confirmation';
    import { MatDialog } from '@angular/material/dialog';
    import { CreateComponent } from '../create/create.component';
    import { ReferensiService } from 'app/services/referensi.service';
    import { ToastrService } from 'ngx-toastr';
    import { KuisonerService } from 'app/services/kuisoner.service';
    import { MatSlideToggleChange } from '@angular/material/slide-toggle';

    @Component({
        selector: 'survei-list',
        templateUrl: './list.component.html',
        encapsulation: ViewEncapsulation.None,
        changeDetection: ChangeDetectionStrategy.OnPush
    })
    export class ListComponent implements OnInit, OnDestroy {
        categories: any[]; // This can be removed if it's not used elsewhere in the component
        items$: Observable<any[]>;
        show;
        groupDiklatList = this._referensiService.groupDiklat();
        topicDiklatList = this._referensiService.groupTopic();
        role: string = this._authService.role;

        private _unsubscribeAll: Subject<any> = new Subject<any>();

        constructor(
            private _referensiService: ReferensiService,
            private _authService: AuthService,
            private _changeDetectorRef: ChangeDetectorRef,
            private _kuisonerService: KuisonerService,
            private _fuseConfirmationService: FuseConfirmationService,
            private _matDialog: MatDialog,
            private _toastr: ToastrService
        ) {}

        ngOnInit(): void {
            this.items$ = this._kuisonerService.items$;
            this.fetch(); // Fetch without filter
        }

        ngOnDestroy(): void {
            this._unsubscribeAll.next(null);
            this._unsubscribeAll.complete();
        }

        fetch(): void {
    this._kuisonerService.getListKuisoner().pipe(takeUntil(this._unsubscribeAll)).subscribe(
        (data) => {
            console.log('Fetched Data:', data); // Log the fetched data here
        },
        (error) => {
            console.error('Error fetching data:', error); // Log any error if it occurs
        }
    );
    this.items$ = this._kuisonerService.items$;
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
            this._kuisonerService.detailKuisoner(data.id).subscribe((item: any) => {
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
                    this._kuisonerService.clone({
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
                    this._kuisonerService.delete(id).subscribe(
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
        }

        toggleCompleted(change: MatSlideToggleChange, item): void {
            const status = (change.checked) ? 'PUBLISHED' : 'DRAFT';
            const params = {
                bucketId: item.id,
                status: (change.checked) ? 'PUBLISHED' : 'DRAFT'
            };
            this._kuisonerService.setBucketStatusKuisoner(params).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Status soal `' + item.name + '` telah diset ' + status);
                        this.fetch();
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
