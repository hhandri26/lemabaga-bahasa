import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS } from 'app/services/referensi.service';
import { Subject, takeUntil } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DiklatService } from 'app/services/diklat.service';

@Component({
    templateUrl: './kehadiran.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class KehadiranComponent implements OnInit, OnDestroy, AfterViewInit {
    participantAttendances = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<KehadiranComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        public _helperService: HelperService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _diklatService: DiklatService,
    ) { }

    ngOnInit(): void {
        this._diklatService.courseAttendance(this._data.id).pipe(takeUntil(this._unsubscribeAll)).subscribe((items) => {
            if (items.success) {
                this.participantAttendances = items.mapData.participantAttendances;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    download(dokumenId): void {
        this._diklatService.courseAttendanceDownload(dokumenId).subscribe((blob: any) => {
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        });
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
