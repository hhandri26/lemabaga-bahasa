/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Component, ChangeDetectionStrategy, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DiklatService } from 'app/services/diklat.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-widget-quiz-question',
    templateUrl: './quiz-question.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizQuestionComponent implements OnInit, OnDestroy {
    @Input() item: any;
    questions: any;
    questionAnswer: any = [];
    formGroup: FormGroup;
    isTestActive: boolean = true;
    sessionTest: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private diklatService: DiklatService,
        private _changeDetectorRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private _toastr: ToastrService,
    ) { }

    ngOnInit(): void {
        this.getSessionTest();
        console.log('item', this.item);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    end(): void {
        if (this.item.activityType === 'PRETEST') {
            this.diklatService.endPretest({ sessionId: this.questions.sessionId }).pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
                if (response.success) {
                    this._toastr.success('Sesi Test telah berakhir');
                    this.questions = null;
                    this._changeDetectorRef.markForCheck();
                } else {
                    this._toastr.error(response?.message, 'ERROR');
                }
            });
        } else {
            this.diklatService.endPosttest({ sessionId: this.questions.sessionId }).pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
                if (response.success) {
                    this._toastr.success('Sesi Test telah berakhir');
                    this.questions = null;
                    this._changeDetectorRef.markForCheck();
                } else {
                    this._toastr.error(response?.message, 'ERROR');
                }
            });
        }
    }

    save(event, questionId): void {
        console.log(event.value);
        const params = {
            sessionId: this.questions.sessionId,
            questionId: questionId,
            answer: null,
            optionAnswer: [event.value]
        };
        if (this.item.activityType === 'PRETEST') {
            this.diklatService.answerPretest(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
                if (response.success) {
                    this._toastr.success('Jawaban berhasil disimpan');
                    // this.questions = null;
                    this._changeDetectorRef.markForCheck();
                } else {
                    this._toastr.error(response?.message, 'ERROR');
                }
            });
        } else {
            this.diklatService.answerPosttest(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
                if (response.success) {
                    this._toastr.success('Jawaban berhasil disimpan');
                    // this.questions = null;
                    this._changeDetectorRef.markForCheck();
                } else {
                    this._toastr.error(response?.message, 'ERROR');
                }
            });
        }
    }

    getSessionTest(): void {
        if (this.item.activityType === 'PRETEST') {
            this.diklatService.getPretest(this.item.courseId).pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
                if (response.success) {
                    if ((response.mapData.data).length) {
                        this.isTestActive = ((response.mapData.data)[0].endedAt === null) ? true : false;
                        this.sessionTest = response.mapData.data[0];
                        this._changeDetectorRef.markForCheck();
                    }
                }
            });
        } else {
            this.diklatService.getPosttest(this.item.courseId).pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
                if (response.success) {
                    this.isTestActive = ((response.mapData.data)[0].endedAt === null) ? true : false;
                    this.sessionTest = response.mapData.data[0];
                    this._changeDetectorRef.markForCheck();
                }
            });
        }
    }

    doTest(): void {
        if (this.item.activityType === 'PRETEST') {
            this.diklatService.startPretest({ courseId: this.item.courseId }).pipe(takeUntil(this._unsubscribeAll)).subscribe((question: any) => {
                if (question.success) {
                    this.questions = question.mapData.data;
                    console.log(question);
                } else {
                    this._toastr.error(question.message);
                    this.questions = null;
                }
                this._changeDetectorRef.markForCheck();
            });
        } else {
            this.diklatService.startPosttest({ courseId: this.item.courseId }).pipe(takeUntil(this._unsubscribeAll)).subscribe((question: any) => {
                if (question.success) {
                    this.questions = question.mapData.data;
                    console.log(question);
                } else {
                    this._toastr.error(question.message);
                    this.questions = null;
                }
                this._changeDetectorRef.markForCheck();
            });
        }
    }

}

