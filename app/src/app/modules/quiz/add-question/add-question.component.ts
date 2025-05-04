import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

@Component({
    selector: 'quiz-add-question',
    templateUrl: './add-question.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizAddQustionComponent implements OnInit {
    @ViewChild('questionInput') questionInput: ElementRef;
    @ViewChild('questionAutosize') questionAutosize: CdkTextareaAutosize;
    @Input() questionType: any;
    @Input() buttonTitle: string = 'Tambah pertanyaan';
    @Output() readonly saved: EventEmitter<string> = new EventEmitter<string>();
    choices: any[] = [];
    note$: Observable<any>;
    levels: any[];
    noteChanged: Subject<any> = new Subject<any>();

    form: UntypedFormGroup;
    formVisible: boolean = false;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
    ) {
    }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            question: ['', [Validators.required]],
            level: ['EASY', [Validators.required]],
            quizType: [{ value: this.questionType === 'PG' ? true : false, disabled: true }, [Validators.required]],
            choiceList: [[]]
        });

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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

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

        this.saved.next(questionRequest);

        this.formVisible = false;
        this.form.get('question').setValue('');
        this.form.get('choiceList').setValue([]);
        setTimeout(() => {
            this.questionInput.nativeElement.value = '';
            this.questionAutosize.reset();
        });

        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle the visibility of the form
     */
    toggleFormVisibility(): void {
        // Toggle the visibility
        this.formVisible = !this.formVisible;

        // If the form becomes visible, focus on the title field
        if (this.formVisible) {
            this.questionInput.nativeElement.focus();
        }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
