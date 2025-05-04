/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DiklatService } from 'app/services/diklat.service';
import { NgSignaturePadOptions, SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    templateUrl: './activity-attendance-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityAttendanceDialogComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('signature')
    public signaturePad: SignaturePadComponent;
    form: FormGroup;
    quizList$: Observable<any[]>;
    selected: any = null;
    isComplete = false;
    public signaturePadOptions: NgSignaturePadOptions = {
        minWidth: 5,
        canvasWidth: 500,
        canvasHeight: 300,
        backgroundColor: '#e2e8f0'
    };
    role: string = this._authService.role;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<ActivityAttendanceDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _authService: AuthService,
        public _helperService: HelperService,
        private _toastr: ToastrService,
        private _diklatService: DiklatService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
    }

    ngAfterViewInit() {
        this.signaturePad.set('minWidth', 5);
        this.signaturePad.clear();
        this._changeDetectorRef.detectChanges();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    drawComplete(event: MouseEvent | Touch) {
        this.isComplete = true;
        console.log('Completed drawing', event);
        console.log(this.signaturePad.toData());
    }

    public clear(): void {
        this.isComplete = false;
        this.signaturePad.clear();
    }

    setSelected(selected): void {
        this.selected = selected;
    }

    create(): void {
        const file: string = this.signaturePad.toDataURL('image/jpeg', 0.5);
        const body = new FormData();
        body.append('activityId', this._data.id);
        body.append('latitude', this._data.lat);
        body.append('location', this._data.location);
        body.append('longitude', this._data.lng);
        body.append('fileTtd', file);

        this._diklatService.feedbackAttendance(body, this.role).pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item) => {
                if (item.success) {
                    this._toastr.success('Absensi berhasil disubmit');
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error('Absensi gagal disubmit, ERROR : ' + item.message);
                    this.matDialogRef.close(false);
                }
            });
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
