/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Component, ChangeDetectionStrategy, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DiklatService } from 'app/services/diklat.service';
import { SurveyKuisonerService } from 'app/services/survey-kuisoner.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'app-widget-survey-kuisoner-question',
    templateUrl: './survey-kuisoner-question.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyKuisonerQuestionComponent implements OnInit, OnDestroy {
    @Input() item: any;
    questions: any;
    questionAnswer: any = [];
    formGroup: FormGroup;
    isTestActive: boolean = true;
    sessionTest: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private diklatService: DiklatService,
        private surveyKuisonerService: SurveyKuisonerService,
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
        this.surveyKuisonerService.endSurveyKuisoner(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            if (response.success) {
                this._toastr.success('Survey telah disubmit');
                this._changeDetectorRef.markForCheck();
                this.route.navigate(['/survey-user-kuisoner']);
            } else {
                this._toastr.error(response?.message, 'ERROR');
            }
        });
    }

save(answer, questionId, isianAnswer): void {
    // Prepare the parameters
    const params = {
        hash: this.activeRoute.snapshot.url[1].path,  // Token hash
        questionId: questionId,  // ID of the question
        answer: null,  // Placeholder for answer, you can update if needed
        optionAnswer: [answer.value],  // Multiple options, if any
        // isianAnswer: isianAnswer  // Pass the ISIAN answer here
    };

    // Call the service to save the survey answer
    this.surveyKuisonerService.answerSurveyKuisoner(params)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            // Handle the response after saving the answer
            if (response.success) {
                this._toastr.success('Jawaban berhasil disimpan');
                this._changeDetectorRef.markForCheck();  // Mark for change detection
            } else {
                this._toastr.error(response?.message, 'ERROR');  // Show error message
            }
        });
}
saveIsian(answer, questionId, isianAnswer): void {
    // Prepare the parameters
    const params = {
        hash: this.activeRoute.snapshot.url[1].path,  // Token hash
        questionId: questionId,  // ID of the question
        answer: null,  // Placeholder for answer, you can update if needed
        optionAnswer: [],  // Multiple options, if any
        isianAnswer: isianAnswer  // Pass the ISIAN answer here
    };

    // Call the service to save the survey answer
    this.surveyKuisonerService.answerSurveyKuisoner(params)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            // Handle the response after saving the answer
            if (response.success) {
                this._toastr.success('Jawaban berhasil disimpan');
                this._changeDetectorRef.markForCheck();  // Mark for change detection
            } else {
                this._toastr.error(response?.message, 'ERROR');  // Show error message
            }
        });
}
toggleAnswer(choice: any, question: any): void {
    // Set semua pilihan ke false, hanya yang diklik ke true
    question.question.options.forEach((opt: any) => {
        opt.isAnswer = (opt === choice);
    });

    // Siapkan parameter untuk backend (hanya satu jawaban)
    const selectedChoice = question.question.options.find((opt: any) => opt.isAnswer);
    const params = {
        hash: this.activeRoute.snapshot.url[1].path,  // Token hash
        questionId: question.question.questionId,  // ID of the question
        likechartAnswer: selectedChoice ? [selectedChoice.label] : [],  // Kirim satu jawaban
        isianAnswer: null,  // Null karena bukan tipe ISIAN
    };

    this.surveyKuisonerService.answerSurveyKuisoner(params)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            if (response.success) {
                this._toastr.success('Jawaban berhasil disimpan');
                this._changeDetectorRef.markForCheck();
            } else {
                this._toastr.error(response?.message, 'ERROR');
            }
        });
}




}
