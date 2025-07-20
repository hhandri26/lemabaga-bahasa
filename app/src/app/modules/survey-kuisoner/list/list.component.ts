/* eslint-disable @typescript-eslint/no-shadow */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { CreateComponent } from '../create/create.component';
import { ReferensiService } from 'app/services/referensi.service';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { KuisonerService } from 'app/services/kuisoner.service';
import { SurveyKuisonerService } from 'app/services/survey-kuisoner.service';
import { RespondenComponent } from '../responden/responden.component';
import { ListRespondenComponentKuisoner } from '../list-responden/list-responden.component';

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
        private _surveyKuisonerService: SurveyKuisonerService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        private _toastr: ToastrService,
        private _clipboard: Clipboard
    ) {
    }

    ngOnInit(): void {
        this.fetch();
        this.items$ = this._surveyKuisonerService.items$;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    fetch(isFilter: boolean = false): void {
        if (isFilter) {
            this._surveyKuisonerService.getListSurveiKuisoner(0, 1000, this.filters).pipe(takeUntil(this._unsubscribeAll)).subscribe();
        } else {
            this._surveyKuisonerService.getListSurveiKuisoner().pipe(takeUntil(this._unsubscribeAll)).subscribe();
        }

        this.items$ = this._surveyKuisonerService.items$;
        this._changeDetectorRef.markForCheck();
    }

    toggleDownload(id): void {
        this._surveyKuisonerService.download(id).subscribe((blob: any) => {
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        });
    }

    toggleShowMode(show: boolean | null = null): void {
        if (show === null) {
            this.show = !this.show;
        } else {
            this.show = show;
        }
        this._changeDetectorRef.markForCheck();
    }

    toggleListResponden(data): void {
        this._surveyKuisonerService.getListparticipant(data.id).subscribe();
        const dialogRef = this._matDialog.open(ListRespondenComponentKuisoner, { data, autoFocus: false });
        // dialogRef.afterClosed().subscribe((result) => {
        //     if (result) {
        //         this.fetch();
        //     }
        // });
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
        const dialogRef = this._matDialog.open(CreateComponent, { autoFocus: false, data });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.fetch();
            }
        });
        // this._surveyService.detail(data.id).subscribe((item: any) => {
        //     if (item?.success) {

        //     } else {
        //         this._toastr.error(item?.message);
        //     }
        // });
    }

    toggleResponden(data): void {
        const dialogRef = this._matDialog.open(RespondenComponent, { width: '50%', autoFocus: false, data });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.fetch();
            }
        });
    }

    toggleDelete(id): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus Survey',
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
                this._surveyKuisonerService.delete(id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Survey telah dihapus');
                            this.fetch();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
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

    copySurveyLink(surveyKuisonerId: string): void {
        const surveyLink = `${window.location.origin}/survey-publik/${surveyKuisonerId}`;
        this._clipboard.copy(surveyLink);
        this._toastr.success('Tautan survey berhasil disalin!', 'Berhasil');
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
