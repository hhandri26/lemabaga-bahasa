import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KuisonerService } from 'app/services/kuisoner.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
    selector: 'kuisoner-edit-question',
    templateUrl: './edit-question.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KuisonerEditQuestionComponent implements OnInit, OnDestroy {
    @ViewChild('questionInput') questionInput: ElementRef;
    @ViewChild('questionAutosize') questionAutosize: CdkTextareaAutosize;
    note$: Observable<any>;
    labels$: Observable<any[]>;
    form: UntypedFormGroup;
    choices: any[] = [];
    levels: any[];
    maxCharIsian= 500;
    noteChanged: Subject<any> = new Subject<any>();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _kuisonerService: KuisonerService,
        private _toastr: ToastrService,
        private _matDialogRef: MatDialogRef<KuisonerEditQuestionComponent>
    ) {
    }

    ngOnInit(): void {
        // Edit
        console.log('this._data', this._data);

        this.form = this._formBuilder.group({
            question: [this._data.questionRequest.question, [Validators.required]],
            level: [this._data.questionRequest.level, [Validators.required]],
            quizType: [{ value: (this._data.bucket.questionType === 'PG') ? true : false, disabled: true }, [Validators.required]],
            choiceList: [[]]
        });

        this.choices = this._data.questionRequest.choiceList;

        this.levels = [
            {
                value: 'EASY',
                label: 'Easy',
                checked: true
            },
            {
                value: 'MEDIUM',
                label: 'Medium',
                checked: false
            },
            {
                value: 'HARD',
                label: 'Hard',
                checked: false
            }
        ];
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    addPilihan(newLabelInput: string): void {
        this.choices.push({ 'label': newLabelInput, 'isAnswer': false });
    }

    removePilihan(index: any): void {
        this.choices.splice(index, 1);
    }

    updatePilihan(index, value: any, type): void {
        if (type === 'label') {
            this.choices[index].label = value;
        }
        if (type === 'option') {
            this.choices.forEach((element: any) => {
                element.isAnswer = false;
            });
            this.choices[index].isAnswer = value;
        }
    }

    save(): void {

        const questionRequest = this.form.getRawValue();
        questionRequest.quizType = (questionRequest.quizType) ? 'PG' : null;
        if (this.choices.length) {
            questionRequest.choiceList = this.choices;
        }
        console.log(questionRequest);

        const params: any = {
            questionId: this._data.questionRequest.id,
            questionRequest
        };
        this._kuisonerService.editQuestionKuisoner(params).subscribe(
            (result) => {
                if (result?.success) {
                    this.form.get('question').setValue('');
                    this.form.get('choiceList').setValue([]);
                    setTimeout(() => {
                        this.questionInput.nativeElement.value = '';
                        this.questionAutosize.reset();
                    });
                    this._toastr.success('Pertanyaan berhasil diubah');
                    this._kuisonerService.detailKuisoner(this._data.bucket.id).subscribe();
                    this._matDialogRef.close();
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );

        // this.saved.next(questionRequest);

        // this.formVisible = false;
        // this.form.get('question').setValue('');
        // this.form.get('choiceList').setValue('');
        // setTimeout(() => {
        //     this.questionInput.nativeElement.value = '';
        //     this.questionAutosize.reset();
        // });

        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
