import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

@Component({
    selector: 'kuisoner-add-question',
    templateUrl: './add-question.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KuisonerAddQustionComponent implements OnInit {
    @ViewChild('questionInput') questionInput: ElementRef;
    @ViewChild('questionAutosize') questionAutosize: CdkTextareaAutosize;
    @Input() questionType: any;
    @Input() buttonTitle: string = 'Tambah pertanyaan';
    @Output() readonly saved: EventEmitter<string> = new EventEmitter<string>();
    choices: any[] = [];
    note$: Observable<any>;
    levels: any[];
    noteChanged: Subject<any> = new Subject<any>();
    likertScale: any[] = [];
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
             kuisonerTipe: ['LIKECHART', [Validators.required]],
            choiceListKuisoner: [[]]
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

        this.form.get('kuisonerTipe').valueChanges.subscribe(val => {
            if (val === 'LIKECHART') {
                this.choices = [
                    { label: 'Sangat Kurang', value: 'SK', isAnswer: false },
                    { label: 'Kurang', value: 'K', isAnswer: false },
                    { label: 'Cukup', value: 'C', isAnswer: false },
                    { label: 'Baik', value: 'B', isAnswer: false },
                    { label: 'Sangat Baik', value: 'SB', isAnswer: false }
                ];
            } else {
                this.choices = [];
            }
            this._changeDetectorRef.markForCheck();
        });
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

    updatePilihan(index: number, value: any, type: string): void {
    if (type === 'label') {
        this.choices[index].label = value;
    }
    if (type === 'option') {
        if (this.form.get('kuisonerTipe').value === 'Likert') {
            // Allow multiple selections for Likert type
            this.choices[index].isAnswer = value;
        } else {
            // Single selection for other types
            this.choices.forEach((element: any) => {
                element.isAnswer = false;
            });
            this.choices[index].isAnswer = value;
        }
    }
}


    save(): void {
        const questionRequest = this.form.getRawValue();
        questionRequest.kuisonerTipe = this.form.get('kuisonerTipe').value;
        if (this.choices.length) {
            questionRequest.choiceListKuisoner = this.choices;
        }

        this.saved.next(questionRequest);

        this.formVisible = false;
        this.form.get('question').setValue('');
        this.form.get('choiceListKuisoner').setValue([]);
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
        this.formVisible = !this.formVisible;
        if (this.formVisible) {
            this.form.get('kuisonerTipe').enable();
            this.questionInput.nativeElement.focus();
        } else {
            this.form.get('kuisonerTipe').disable();
        }
    }



    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
