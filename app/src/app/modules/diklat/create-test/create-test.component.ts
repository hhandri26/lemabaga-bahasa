/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { DiklatService } from 'app/services/diklat.service';
import { QuizService } from 'app/services/quiz.service';

@Component({
    templateUrl: './create-test.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTestComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    quizList$: Observable<any[]>;
    selected: any = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateTestComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _quizService: QuizService,
        private _toastr: ToastrService,
        private _diklatService: DiklatService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        // console.log('this._data', this._data);
        this._quizService.getList(0, 1000, {
            byCourseId: this._data.id,
            byCourseGroupId: this._data.courseGroup.id
        }).subscribe();
        this.quizList$ = this._quizService.items$;
        this.form = this._formBuilder.group({
            courseId: [this._data.id, [Validators.required]],
            jenisCourseTest: [this._data.jenis, [Validators.required]],
            bucketId: [this._data.assign?.bucketId ?? null, [Validators.required]]
        });
        this.form.get('bucketId').valueChanges.subscribe((selected) => {
            this.selected = selected;
        });
    }

    ngAfterViewInit() {
        (<any>Object).values(this.form.controls).forEach((control) => {
            control.markAsTouched();
        });
        this._changeDetectorRef.detectChanges();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    setSelected(selected): void {
        this.selected = selected;
    }

    create(): void {
        const formInput: any = this.form.getRawValue();
        const params: any = {
            courseId: formInput.courseId,
            jenisCourseTest: formInput.jenisCourseTest,
            bucketId: formInput.bucketId.id
        };
        this._diklatService.assignCourseTest(JSON.stringify(params)).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Test berhasil diset');
                    this.form.reset();
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
