/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Component, ChangeDetectionStrategy, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DiklatService } from 'app/services/diklat.service';
import { SurveyService } from 'app/services/survey.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-widget-survey-question',
    templateUrl: './survey-question.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyQuestionComponent implements OnInit, OnDestroy {
    @Input() item: any;
    questions: any;
    questionAnswer: any = [];
    formGroup: FormGroup;
    isTestActive: boolean = true;
    sessionTest: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private diklatService: DiklatService,
        private surveyService: SurveyService,
        private _changeDetectorRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private _toastr: ToastrService,
        private activeRoute: ActivatedRoute,
        private route: Router
    ) { }

    ngOnInit(): void {
        this.questions = this.item.questionFeedbacks;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    end(): void {
        const params = {
            hash: this.activeRoute.snapshot.url[1].path
        };
        this.surveyService.endSurvey(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            if (response.success) {
                this._toastr.success('Survey telah disubmit');
                this._changeDetectorRef.markForCheck();
                this.route.navigate(['/survey-user']);
            } else {
                this._toastr.error(response?.message, 'ERROR');
            }
        });
    }

    save(answer, questionId): void {
        const params = {
            hash: this.activeRoute.snapshot.url[1].path,
            questionId: questionId,
            answer: null,
            optionAnswer: [answer.value]
        };
        this.surveyService.answerSurvey(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            if (response.success) {
                this._toastr.success('Jawaban berhasil disimpan');
                this._changeDetectorRef.markForCheck();
            } else {
                this._toastr.error(response?.message, 'ERROR');
            }
        });
    }
}
