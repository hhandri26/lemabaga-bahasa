/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ForumService } from 'app/services/forum.service';
import { QuizService } from 'app/services/quiz.service';

@Component({
    templateUrl: './create.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CreateComponent implements OnInit, OnDestroy {
    form: FormGroup;
    groupDiklatList = this._referensiService.groupDiklat();
    topicDiklatList = this._referensiService.groupTopic();
    onFileInputed: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _quizService: QuizService,
    ) { }

    ngOnInit(): void {
        console.log('this._data', this._data);
        this.form = this._formBuilder.group({
            courseGroupId: [this._data?.courseGroup.id ?? ''],
            // courseTopicId: [this._data?.courseTopicId ?? '', [Validators.required]],
            name: [this._data?.name ?? '', [Validators.required]],
            type: [this._data?.type ?? 'DIKLAT', [Validators.required]],
            questionType: [this._data?.questionType ?? 'PG', [Validators.required]],
            durationInMinutes: [this._data?.durationInMinutes ?? 0, [Validators.required]],
            surveyType: [null],
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    create(): void {
        const formInput: any = this.form.getRawValue();
        const params: any = {
            name: formInput.name,
            type: formInput.type,
            courseGroupId: formInput.courseGroupId,
            // courseTopicId: formInput.courseTopicId,
            questionType: formInput.questionType,
            surveyType: formInput.surveyType,
            durationInMinutes: formInput.durationInMinutes,
        };
        if(this._data?.id){
            params.id = this._data?.id;
            this._quizService.save(params).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Kelompok soal berhasil diubah');
                        this.form.reset();
                        this._quizService.getList().subscribe();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        } else {
            this._quizService.create(params).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Kelompok soal berhasil ditambahkan');
                        this.form.reset();
                        this._quizService.getList().subscribe();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
