import { Component, ChangeDetectionStrategy, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DiklatService } from 'app/services/diklat.service';
import { Subject, takeUntil } from 'rxjs';


@Component({
    selector: 'app-widget-activity-url',
    templateUrl: './activity-url.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityUrlComponent implements OnInit, OnDestroy {
    @Input() item: any;
    isOpen: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private diklatService: DiklatService,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    load(): void {
        const parentUrl = this._router.url.split('/');
        this.diklatService.getPlayById(parentUrl[3]).subscribe();
    }

    checked(): void {
        this.diklatService.checkedActivity(this.item.id).pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            if (response.success) {
                this.item.track.isChecked = true;
                this.load();
            } else {
                this.item.track.isChecked = false;
            }
            this._changeDetectorRef.markForCheck();
        });
    }

}

