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
                // Initialize with default Likert scale labels
                this.choices = [
                    { label: 'Kurang', value: 'K', isAnswer: false },
                    { label: 'Cukup', value: 'C', isAnswer: false },
                    { label: 'Baik', value: 'B', isAnswer: false },
                    { label: 'Sangat Baik', value: 'SB', isAnswer: false }
                ];
                // Ensure minimum of 4 choices and even number
                while (this.choices.length < 4) {
                    this.choices.push({ label: `Pilihan ${this.choices.length + 1}`, value: `P${this.choices.length + 1}`, isAnswer: false });
                }
                if (this.choices.length % 2 !== 0) {
                    this.choices.push({ label: `Pilihan ${this.choices.length + 1}`, value: `P${this.choices.length + 1}`, isAnswer: false });
                }
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
        const defaultLabels = ['Sangat Kurang', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik'];
        let newLabel = newLabelInput;
        if (!newLabelInput) {
            // If no input, use a default label from the Likert scale or a generic one
            newLabel = defaultLabels[this.choices.length] || `Pilihan ${this.choices.length + 1}`;
        }
        this.choices.push({ 'label': newLabel, 'isAnswer': false });

        // Ensure the number of choices is always even and at least 4
        if (this.choices.length < 4) {
            while (this.choices.length < 4) {
                const nextLabel = defaultLabels[this.choices.length] || `Pilihan ${this.choices.length + 1}`;
                this.choices.push({ label: nextLabel, value: `P${this.choices.length + 1}`, isAnswer: false });
            }
        } else if (this.choices.length % 2 !== 0) {
            const nextLabel = defaultLabels[this.choices.length] || `Pilihan ${this.choices.length + 1}`;
            this.choices.push({ label: nextLabel, value: `P${this.choices.length + 1}`, isAnswer: false });
        }
    }

    removePilihan(index: any): void {
        this.choices.splice(index, 1);
        const defaultLabels = ['Sangat Kurang', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik'];

        // Ensure the number of choices is always even and at least 4 after removal
        if (this.choices.length < 4) {
            while (this.choices.length < 4) {
                const nextLabel = defaultLabels[this.choices.length] || `Pilihan ${this.choices.length + 1}`;
                this.choices.push({ label: nextLabel, value: `P${this.choices.length + 1}`, isAnswer: false });
            }
        } else if (this.choices.length % 2 !== 0) {
            // If odd after removal, remove one more to make it even, or add if it's below 4
            if (this.choices.length > 4) {
                this.choices.splice(this.choices.length - 1, 1);
            } else {
                const nextLabel = defaultLabels[this.choices.length] || `Pilihan ${this.choices.length + 1}`;
                this.choices.push({ label: nextLabel, value: `P${this.choices.length + 1}`, isAnswer: false });
            }
        }
        // Re-assign default labels if choices are within the initial Likert scale range
        this.choices.forEach((choice, i) => {
            if (i < defaultLabels.length) {
                choice.label = defaultLabels[i];
            }
        });
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
