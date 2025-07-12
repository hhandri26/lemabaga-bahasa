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
            level: ['EASY', [Validators.required]],
            kuisonerTipe: [this._data.bucket.questionType === 'PG' ? 'LIKECHART' : this._data.bucket.questionType, [Validators.required]],
            choiceListKuisoner: [[]]
        });

        // Initialize choices based on kuisonerTipe
        this.choices = this._data.questionRequest.choiceListKuisoner || [];
        if (this.form.get('kuisonerTipe').value === 'LIKECHART' && this.choices.length === 0) {
            this.choices = [
                { label: 'Kurang', value: 'K', isAnswer: false },
                { label: 'Cukup', value: 'C', isAnswer: false },
                { label: 'Baik', value: 'B', isAnswer: false },
                { label: 'Sangat Baik', value: 'SB', isAnswer: false }
            ];
            while (this.choices.length < 4) {
                this.choices.push({ label: `Pilihan ${this.choices.length + 1}`, value: `P${this.choices.length + 1}`, isAnswer: false });
            }
            if (this.choices.length % 2 !== 0) {
                this.choices.push({ label: `Pilihan ${this.choices.length + 1}`, value: `P${this.choices.length + 1}`, isAnswer: false });
            }
        }

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
                    { label: 'Kurang', value: 'K', isAnswer: false },
                    { label: 'Cukup', value: 'C', isAnswer: false },
                    { label: 'Baik', value: 'B', isAnswer: false },
                    { label: 'Sangat Baik', value: 'SB', isAnswer: false }
                ];
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

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    addPilihan(newLabelInput: string): void {
        const defaultLabels = ['Sangat Kurang', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik'];
        let newLabel = newLabelInput;
        if (!newLabelInput) {
            newLabel = defaultLabels[this.choices.length] || `Pilihan ${this.choices.length + 1}`;
        }
        this.choices.push({ 'label': newLabel, 'isAnswer': false });

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

        if (this.choices.length < 4) {
            while (this.choices.length < 4) {
                const nextLabel = defaultLabels[this.choices.length] || `Pilihan ${this.choices.length + 1}`;
                this.choices.push({ label: nextLabel, value: `P${this.choices.length + 1}`, isAnswer: false });
            }
        } else if (this.choices.length % 2 !== 0) {
            if (this.choices.length > 4) {
                this.choices.splice(this.choices.length - 1, 1);
            } else {
                const nextLabel = defaultLabels[this.choices.length] || `Pilihan ${this.choices.length + 1}`;
                this.choices.push({ label: nextLabel, value: `P${this.choices.length + 1}`, isAnswer: false });
            }
        }
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
            if (this.form.get('kuisonerTipe').value === 'LIKECHART') {
                this.choices.forEach((element: any) => {
                    element.isAnswer = false;
                });
                this.choices[index].isAnswer = value;
            } else {
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
        console.log(questionRequest);

        const params: any = {
            questionId: this._data.questionRequest.id,
            questionRequest
        };
        this._kuisonerService.editQuestionKuisoner(params).subscribe(
            (result) => {
                if (result?.success) {
                    this.form.get('question').setValue('');
                    this.form.get('choiceListKuisoner').setValue([]);
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
        this._changeDetectorRef.markForCheck();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
