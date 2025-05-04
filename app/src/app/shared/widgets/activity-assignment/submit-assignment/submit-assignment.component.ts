/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DiklatService } from 'app/services/diklat.service';
import { ReferensiService } from 'app/services/referensi.service';

@Component({
    templateUrl: './submit-assignment.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmitAssignmentComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    quizList$: Observable<any[]>;
    selected: any = null;
    file = null;
    onFileInputed: boolean = false;
    __documents$ = new BehaviorSubject<any[]>([]);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<SubmitAssignmentComponent>,
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
            keterangan: [],
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
            activityId: this._data.id,
            keterangan: formInput.keterangan
        };

        this.uploadDocument(formInput.file, { title: 'MATERI : ' + formInput.file.name });
		this.__documents$.subscribe((d: any) => {
            if (d?.success) {
                params.documentId = d.mapData.data.id;
                this._diklatService.feedbackAssignment(params).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Lampiran Tugas berhasil diunggah');
                            this.form.reset();
                            this.matDialogRef.close(true);
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
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
