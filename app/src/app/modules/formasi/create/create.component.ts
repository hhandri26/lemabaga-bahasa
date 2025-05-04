/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, filter, fromEvent, map, Observable, of, startWith, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { KegiatanService } from 'app/services/kegiatan.service';
import moment from 'moment';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormasiService } from 'app/services/formasi.service';
// import { UserService } from 'app/services/user.service';

@Component({
    templateUrl: './create.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CreateComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    form: FormGroup;
    file = null;
    onFileInputed: boolean = false;

    baseUrl = environment.baseUrl;

    jenisJabatan$: Observable<any[]> = this._referensiService.jabatan();
    satuanOrganisasi$: Observable<any[]>;

    options: FormlyFormOptions = {};
    model: any = { formasiDetails: [] };
    formFormasi = new FormGroup({});
    fields: FormlyFieldConfig[] = [
        {
            key: 'formasiDetails',
            type: 'form_formasi_rows',
            fieldArray: {
                fieldGroup: [
                    {
                        fieldGroupClassName: 'grid grid-flow-col-dense grid-cols-4 gap-4',
                        fieldGroup: [
                            {
                                type: 'select',
                                key: 'jabatanId',
                                className: 'formly-jabatanId col-span-1',
                                templateOptions: {
                                    label: 'Jenis Jabatan',
                                    multiple: false,
                                    valueProp: o => o.id,
                                    // compareWith: (o1, o2) => o1.id === o2?.id,
                                    options: this._referensiService.jabatan(),
                                    required: true,
                                    appearance: 'fill',
                                    labelProp: 'nama',
                                },
                                expressionProperties: {
                                    'templateOptions.disabled': (model: any, formState: any, field) => {
                                        const key = +field.parent.parent.key;
                                        const arr = this.model.formasiDetails[key]?.formula;
                                        if(Array.isArray(arr)){
                                            return (arr.length > 0) ? true : false;
                                        }
                                        return false;
                                    },
                                },
                            },
                            {
                                type: 'input',
                                key: 'unitKerja',
                                className: 'formly-unitKerja col-span-3',
                                templateOptions: {
                                    label: 'Nama Unit Kerja',
                                    required: true,
                                    appearance: 'fill'
                                },
                            },
                        ]
                    },
                    {
                        key: 'formula',
                        type: 'form_formasi_formula',
                        fieldArray: {
                            fieldGroup: [
                                {
                                    type: 'select',
                                    key: 'uraianTugasId',
                                    className: 'formly-uraianTugasId',
                                    defaultValue: 0,
                                    templateOptions: {
                                        multiple: false,
                                        valueProp: o => o,
                                        compareWith: (o1, o2) => o1.id === o2.id,
                                        required: true,
                                        appearance: 'fill',
                                        labelProp: 'text',
                                    },
                                    expressionProperties: {
                                        'templateOptions.options': (model: any, formState: any, field) => {
                                            const key = +field.parent.parent.parent.key;
                                            return this._referensiService.uraianTugas(this.model.formasiDetails[key].jabatanId);
                                        },
                                    },
                                },
                                {
                                    type: 'input',
                                    key: 'output',
                                    className: 'formly-output',
                                    templateOptions: {
                                        type: 'number',
                                        required: true,
                                        appearance: 'fill'
                                    },
                                    expressionProperties: {
                                        'templateOptions.disabled': f => (!f.uraianTugasId)
                                    }
                                },
                                {
                                    type: 'type_string',
                                    key: 'waktu',
                                    className: 'formly-waktu',
                                    hideExpression: f => !f.output,
                                    hooks: {
                                        onInit: f => f.form.valueChanges.pipe(
                                            startWith(f.form.value),
                                            tap((value) => {
                                                f.formControl.setValue((value.uraianTugasId.workPerHour), { onlySelf: true });
                                            })
                                        )
                                    },
                                },
                            ],
                        },
                    },
                ],
            }
        }
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _referensiService: ReferensiService,
        private _formasiService: FormasiService,
        private _toastr: ToastrService,
        private _userService: UserService,
        private _penerjemahService: PenerjemahService,
    ) { }

    ngOnInit(): void {
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: any) => {
            this.satuanOrganisasi$ = this._referensiService.satuanOrganisasi({ instansiId: user.instansiId.id });
            this._changeDetectorRef.markForCheck();
        });
        this.form = this._formBuilder.group({
            id: [''],
            satuanOrganisasiId: [null, [Validators.required]],
            file: [null, Validators.required]
        });
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    create(): void {
        const formInput = this.form.getRawValue();
        const formasiDetails = [];

        this.model.formasiDetails.forEach((e) => {
            const formula = [];
            e.formula.forEach((f) => {
                formula.push({uraianTugasId: f.uraianTugasId.id, output: +f.output});
            });
            formasiDetails.push({unitKerja: e.unitKerja, jabatanId: e.jabatanId, formula});
        });
        console.log('formasiDetails', formasiDetails);
        const body = new FormData();
        body.append('formasiDetails', JSON.stringify(formasiDetails));
        body.append('satuanOrganisasiId', formInput.satuanOrganisasiId);
        if (formInput.file) { body.append('file', formInput.file); }

        this._formasiService.createUsul(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Usulan membutuhkan waktu approvel oleh Pembina Penerjemah', 'Formasi berhasil diusulkan');
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

    displayFn(item) {
        if (item) { return item.nama; }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
