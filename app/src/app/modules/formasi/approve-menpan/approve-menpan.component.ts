/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormArray, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { filter, startWith, Subject, tap } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormasiService } from 'app/services/formasi.service';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';

@Component({
    templateUrl: './approve-menpan.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: ['::ng-deep .formly-hide { display: none !important; }'],
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class ApproveMenpanComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    options: FormlyFormOptions = {};
    model: any = { count: 1, formasiDetailApproved: [{}] };
    formFormasi: any = new FormGroup({});
    fields: FormlyFieldConfig[] = [
        {
            className: 'formly-hide',
            key: 'count',
            type: 'input',
            templateOptions: {
                hidden: true,
                disabled: true
            },
            hooks: {
                onInit: field => field.formControl.valueChanges.pipe(
                    startWith(field.formControl.value),
                    filter(v => v > 0),
                    tap((value) => {
                        this.model.formasiDetailApproved.length = value;
                        this.model = {
                            ...this.model,
                            count: value,
                        };
                    }),
                ),
            },
        },
        {
            key: 'formasiDetailApproved',
            type: 'form_formasi_approve',
            fieldArray: {
                fieldGroup: [
                    {
                        key: 'id',
                        type: 'input',
                        hooks: {
                            onInit: f => f.form.valueChanges.pipe(
                                startWith(f.form.value),
                                tap((value) => {
                                    f.formControl.setValue((value.id), { onlySelf: true });
                                })
                            )
                        },
                    },
                    {
                        type: 'type_string',
                        key: 'unitKerjaNama',
                        className: 'formly-unitKerjaNama',
                        hooks: {
                            onInit: f => f.form.valueChanges.pipe(
                                startWith(f.form.value),
                                tap((value) => {
                                    f.formControl.setValue((value.unitKerjaNama), { onlySelf: true });
                                })
                            )
                        },
                    },
                    {
                        type: 'type_string',
                        key: 'jabatanNama',
                        className: 'formly-jabatanNama',
                        hooks: {
                            onInit: f => f.form.valueChanges.pipe(
                                startWith(f.form.value),
                                tap((value) => {
                                    f.formControl.setValue((value.jabatanNama), { onlySelf: true });
                                })
                            )
                        },
                    },
                    {
                        type: 'type_string',
                        key: 'sumOfWorkerNeeds',
                        className: 'formly-sumOfWorkerNeeds',
                        hooks: {
                            onInit: f => f.form.valueChanges.pipe(
                                startWith(f.form.value),
                                tap((value) => {
                                    f.formControl.setValue((value.sumOfWorkerNeeds), { onlySelf: true });
                                })
                            )
                        },
                    },
                    {
                        type: 'input',
                        key: 'sumOfWorkerNeedsApproved',
                        className: 'formly-sumOfWorkerNeedsApproved',
                        templateOptions: {
                            type: 'number',
                            required: true,
                            appearance: 'fill'
                        }
                    },
                ],
            }
        }
    ];
    onFileInputed: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<ApproveMenpanComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formasiService: FormasiService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            file: ['', [Validators.required]]
        });

    }

    ngAfterViewInit() {
        const patchValue: any = [];
        this._data.formasiDetails.forEach((element) => {
            patchValue.push({ id: element.id, jabatanNama: element.jabatanNama, unitKerjaNama: element.unitKerjaNama, sumOfWorkerNeeds: element.sumOfWorkerNeeds, sumOfWorkerNeedsApproved: 0 });
        });
        this.formFormasi.get('count').setValue(patchValue.length);
        (this.formFormasi.get('formasiDetailApproved') as unknown as FormArray).patchValue(patchValue);
        this._changeDetectorRef.detectChanges();
        this._changeDetectorRef.markForCheck();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    send(): void {
        this.formFormasi.markAllAsTouched();
        const formasiDetailApproved: any = [];
        this.model.formasiDetailApproved.forEach((element) => {
            formasiDetailApproved.push({id: element.id, sumOfWorkerNeedsApproved: element.sumOfWorkerNeedsApproved});
        });
        const formInput = this.form.getRawValue();
        const body = new FormData();
        body.append('formasiId', this._data.formasiId);
        body.append('formasiDetailApproved', JSON.stringify(formasiDetailApproved));
        if (formInput.file) { body.append('file', formInput.file); }
        this._formasiService.sendMenpan(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Rekomendasi persetujuan formasi berhasil disubmit');
                    this.form.reset();
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    toggleOnFileInputed(onFileInputed: boolean | null = null): void {
        if (onFileInputed === null) {
            this.onFileInputed = !this.onFileInputed;
        } else {
            if (!onFileInputed) {
                this.form.get('file').setValue(null);
                (document.getElementById('fileDokumen') as HTMLElement).innerText = null;
            }
            this.onFileInputed = onFileInputed;
        }
        this._changeDetectorRef.markForCheck();
    }

    onFileInput(event) {
        const response = this._referensiService.onFileInputSingle(event, 'application/pdf', 2000);
        if (!response.isSuccess) {
            this._toastr.error(response.msg, 'ERROR');
            return false;
        }
        this.onFileInputed = true;
        (document.getElementById('fileDokumen') as HTMLElement).innerText = response.fileInfo.name;
        this.form.get('file').setValue(event.target.files[0]);
        return true;
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
