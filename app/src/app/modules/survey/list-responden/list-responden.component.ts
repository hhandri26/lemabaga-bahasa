/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS } from 'app/services/referensi.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { SurveyService } from 'app/services/survey.service';
import { Pagination } from 'app/modules/penerjemah/penerjemah.types';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
    templateUrl: './list-responden.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class ListRespondenComponent implements OnInit, OnDestroy {
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    items$: Observable<any[]>;
    pagination: Pagination;
    selected: any;
    displayedColumns: string[] = ['no', 'nip', 'nama', 'instansi'];
    dataSource = new MatTableDataSource<any>();
    pageSize = 10;
    length = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<ListRespondenComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        public _helperService: HelperService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _surveyService: SurveyService,
    ) { }

    ngOnInit(): void {
        this._surveyService.itemParticipants$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                console.log('item', item);
                if(item){
                    this.dataSource = new MatTableDataSource(item.slice(0, this.pageSize));
                    this.dataSource.paginator = this.paginator;
                    this.length = item.length;
                    this._changeDetectorRef.markForCheck();
                }
            });

        this._surveyService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });
    }

    onPageChanged(e) {
        const firstCut = e.pageIndex * e.pageSize;
        const secondCut = firstCut + e.pageSize;
        this.dataSource.data = this.selected.undanganDtoList.slice(firstCut, secondCut);
        this._changeDetectorRef.markForCheck();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
