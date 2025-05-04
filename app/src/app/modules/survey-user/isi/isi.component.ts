/* eslint-disable @typescript-eslint/no-shadow */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { SurveyService } from 'app/services/survey.service';

@Component({
    templateUrl: './isi.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IsiComponent implements OnInit, OnDestroy {
    _item: any;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private route: ActivatedRoute,
        private _elementRef: ElementRef,
        private _surveyService: SurveyService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.fetch();
    }

    fetch(): void {
        this._surveyService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                console.log('====>', item);
                this._item = item;
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

}
