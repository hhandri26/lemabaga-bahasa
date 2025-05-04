import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS } from 'app/services/referensi.service';
import { Subject, takeUntil } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DiklatService } from 'app/services/diklat.service';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
    templateUrl: './set-bobot.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class SetBobotComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    valueDiscipline = 25;
    valueActiveness = 25;
    valuePreTest = 25;
    valuePostTest = 25;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<SetBobotComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        public _helperService: HelperService,
        private _diklatService: DiklatService,
        private _toastr: ToastrService,
    ) { }

    ngOnInit(): void {
        // this._diklatService.courseAttendance(this._data.id).pipe(takeUntil(this._unsubscribeAll)).subscribe((items) => {
        //     if (items.success) {
        //         this.participantAttendances = items.mapData.participantAttendances;
        //         this._changeDetectorRef.markForCheck();
        //     }
        // });
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    create(): void {
        const params: any = {
            courseId: this._data.id,
            discipline: this.valueDiscipline,
            activeness: this.valueActiveness,
            preTest: this.valuePreTest,
            postTest: this.valuePostTest
        };
        this._diklatService.setBobot(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Bobot penilaian berhasil diset');
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message);
                }
            }
        );
    }
}
