import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { Subject } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DiklatService } from 'app/services/diklat.service';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
    templateUrl: './set-template-sertifikat.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class SetTemplateSertifikatComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    onFileInputed: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<SetTemplateSertifikatComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        public _helperService: HelperService,
        private _diklatService: DiklatService,
        private _toastr: ToastrService,
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _referensiService: ReferensiService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            file: [null, [Validators.required]]
        });
    }

    ngAfterViewInit(): void {

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
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

    onFileInput(event): any {
        const response = this._referensiService.onFileInputSingle(event, 'image/jpeg', 2000);
        if (!response.isSuccess) {
            this._toastr.error(response.msg, 'ERROR');
            return false;
        }
        this.onFileInputed = true;
        (document.getElementById('fileDokumen') as HTMLElement).innerText = response.fileInfo.name;
        this.form.get('file').setValue(event.target.files[0]);
        return true;
    }

    download(): void {
        window.open('/assets/certificate_template.docx', '_blank');
    }

    create(): void {
        const formInput: any = this.form.getRawValue();
        const params: any = {
            courseId: this._data.id,
            file: formInput.keterangan
        };
        const body = new FormData();
        body.append('courseId', this._data.id);
        if (formInput.file) {
            body.append('template', formInput.file);
        }

        this._diklatService.setTemplateCertificate(body).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Template sertifikat berhasil diset');
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message);
                }
            }
        );
    }
}
