/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ForumService } from 'app/services/forum.service';

@Component({
    templateUrl: './create.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CreateComponent implements OnInit, OnDestroy {
    form: FormGroup;
    jenisForumList = this._referensiService.jenisForum();
    typeForumList = this._helperService.typeForumList();
    onFileInputed: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _forumService: ForumService,
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            categoryId: [this._data?.categoryId ?? '', [Validators.required]],
            title: [this._data?.title ?? '', [Validators.required]],
            content: [this._data?.content ?? '', [Validators.required]],
            type: ['PUBLIC', [Validators.required]],
            file: [''],
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    create(): void {
        const formInput: any = this.form.getRawValue();
        const body = new FormData();
        body.append('categoryId', formInput.categoryId);
        body.append('title', formInput.title);
        body.append('content', formInput.content);
        body.append('type', formInput.type);
        if(formInput.file){
            body.append('file', formInput.file);
        }
        if(this._data?.id){
            body.append('id', this._data?.id);
            this._forumService.save(body).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Forum berhasil diubah');
                        this.form.reset();
                        this._forumService.getList().subscribe();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        } else {
            this._forumService.create(body).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Forum berhasil ditambahkan');
                        this.form.reset();
                        this._forumService.getList().subscribe();
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
                this.form.get('file').setValue(null);
                (document.getElementById('fileDokumen') as HTMLElement).innerText = null;
            }
            this.onFileInputed = onFileInputed;
        }
        this._changeDetectorRef.markForCheck();
    }

    onFileInput(event) {
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

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
