/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DiklatService } from 'app/services/diklat.service';
import moment from 'moment';

@Component({
    templateUrl: './create-aktivitas-tugas-materi.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CreateAktivitasTugasMateriComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('expandable', { static: true }) expandable: any;
    form: FormGroup;
    file = null;
    attachments = [];
    onFileInputed: boolean = false;
    jenisMaterialList = this._referensiService.jenisMaterialList();
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateAktivitasTugasMateriComponent>,
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
            title: [null],
            activityGroupId: [this._data?.id, [Validators.required]],
            dueDateCompletion: [this._data?.description, [Validators.required]],
            dueTimeCompletion: [this._data?.description, [Validators.required]],
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

    create(): void {
        const formInput: any = this.form.getRawValue();
        const params: any = {
            id: formInput.id,
            activityGroupId: formInput.activityGroupId,
            dueDateCompletion: moment(formInput.dueDateCompletion).format('YYYY-MM-DD') + ' ' + (formInput.dueTimeCompletion).substring(0,2) + ':' + (formInput.dueTimeCompletion).substring(2,4),
            documents: this.attachments.map(item => item.id)
        };

        if(this._data?.id){
            this._diklatService.activityAssignment(JSON.stringify(params)).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Tugas berhasil diubah');
                        this.form.reset();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        } else {
            this._diklatService.activityAssignment(JSON.stringify(params)).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Tugas berhasil ditambahkan');
                        this.form.reset();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        }
    }

    toggleOnFileInputed(onFileInputed: boolean | null = null): void {
        if (onFileInputed === null) {
            this.onFileInputed = !this.onFileInputed;
        } else {
            if (!onFileInputed) {
                // this.form.get('file').setValue(null);
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
        const formInput: any = this.form.getRawValue();
        const formData = new FormData();
        formData.append('title', formInput.title);
        formData.append('file', event.target.files[0]);
        // const test: any = {
        //     id: 'c2607d56-470a-4092-a269-27f053c770e7',
        //     title: 'sss',
        //     path: '/home/upload/course/public/filerepo/2023/5/25/c2607d56-470a-4092-a269-27f053c770e7',
        //     originalFilename: '532-Article Text-1437-2-10-20210903.pdf',
        //     mimeType: 'application/pdf',
        //     size: 1047276 };
        //     this.attachments.push(test);
        //     this.expandable.expanded = false;
        //     this.form.get('title').setValue(null);
        this._diklatService.courseDocumentUpload(formData).subscribe(
            (result) => {
                if (result?.success) {
                    this.attachments.push(result.mapData.data);
                    this.expandable.expanded = false;
                    this._toastr.success('Materi `' + result.mapData.data + '` berhasil ditambahkan');
                    this.form.get('title').setValue(null);
                    this._changeDetectorRef.markForCheck();
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
        return true;
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
