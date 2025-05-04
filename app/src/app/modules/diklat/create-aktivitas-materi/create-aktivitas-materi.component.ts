/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DiklatService } from 'app/services/diklat.service';

@Component({
    templateUrl: './create-aktivitas-materi.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CreateAktivitasMateriComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    file = null;
    onFileInputed: boolean = false;
    jenisMaterialList = this._referensiService.jenisMaterialList();
    instructuresList$: Observable<any[]> = this._referensiService.instructures();
    __documents$ = new BehaviorSubject<any[]>([]);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateAktivitasMateriComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _diklatService: DiklatService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            id: [this._data?._id ?? null],
            activityGroupId: [this._data?.id, [Validators.required]],
            description: [this._data?.description, [Validators.required]],
            materiType: [this._data?.materiType, [Validators.required]],
            documentId: [this._data?.documentId ?? null],
            numDurationInMinute: [this._data?.numDurationInMinute],
            numPage: [this._data?.numPage],
            link: [this._data?.link],
            file: [null, [Validators.required]]
        });
    }

    ngAfterViewInit() {
        (<any>Object).values(this.form.controls).forEach((control) => {
            control.markAsTouched();
        });
        this._changeDetectorRef.detectChanges();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    async uploadDocument(file, queryParams) {
		const body: FormData = new FormData();
		body.append('file', file, file.name);

		await this._diklatService.courseDocumentUpload(body).pipe().subscribe(
			(data) => {
				console.log('ActivityAddComponent->courseDocumentUpload-data', data);
				if (data.success) {
					this.__documents$.next(data);
					this._toastr.success('File `' + file.name + '` berhasil diupload');
				} else {
					this._toastr.error('File `' + file.name + '` gagal diupload, ERROR : ' + data.message);
				}
			},
			err => this._toastr.error('File `' + file.name + '` gagal diupload, ERROR : ' + err.error.message)
		);
	}

    create(): void {
        const formInput: any = this.form.getRawValue();
        const params: any = {
            id: formInput.id,
            activityGroupId: formInput.activityGroupId,
            instructureId: formInput.instructureId,
            description: formInput.description,
            materiType: formInput.materiType,
            numDurationInMinute: formInput.numDurationInMinute,
            numPage: formInput.numPage,
            link: formInput.link
        };

        // if (formInput.file) { params.documentId = formInput.file; }
        this.uploadDocument(formInput.file, { title: 'MATERI : ' + formInput.file.name });
		this.__documents$.subscribe((d: any) => {
			console.log('ActivityAddComponent->__documents', d);
			if (d) {
				if (d.success) {
                    params.documentId = d.mapData.data.id;
                    if(this._data?.id){
                        this._diklatService.activityMaterial(JSON.stringify(params)).subscribe(
                            (result) => {
                                if (result?.success) {
                                    this._toastr.success('Materi `' + formInput.description + '` berhasil diubah');
                                    this.form.reset();
                                    this.matDialogRef.close(true);
                                } else {
                                    this._toastr.error(result?.message, 'ERROR');
                                }
                            }
                        );
                    } else {
                        this._diklatService.activityMaterial(JSON.stringify(params)).subscribe(
                            (result) => {
                                if (result?.success) {
                                    this._toastr.success('Materi `' + formInput.description + '` berhasil ditambahkan');
                                    this.form.reset();
                                    this.matDialogRef.close(true);
                                } else {
                                    this._toastr.error(result?.message, 'ERROR');
                                }
                            }
                        );
                    }
				}
			}
		});
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
        const response = this._referensiService.onFileInputSingle(event, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 8000);
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
