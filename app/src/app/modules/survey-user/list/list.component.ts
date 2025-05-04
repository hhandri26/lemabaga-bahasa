/* eslint-disable @typescript-eslint/no-shadow */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatDialog } from '@angular/material/dialog';
import { ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { SurveyService } from 'app/services/survey.service';

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
        private _surveyService: SurveyService) {
    }

    ngOnInit(): void {
        this.fetch();
        this.items$ = this._surveyService.items$;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    fetch(): void {
        this._surveyService.getListByMe().pipe(takeUntil(this._unsubscribeAll)).subscribe();

        this.items$ = this._surveyService.items$;
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

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
