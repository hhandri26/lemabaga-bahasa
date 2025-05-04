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
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DiklatService } from 'app/services/diklat.service';
import moment from 'moment';
import { environment } from 'environments/environment';

@Component({
    templateUrl: './create-sesi.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class CreateSesiComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    jenisKegiatanList = this._helperService.jenisKegiatanList();
    groupDiklatList$: Observable<any[]> = this._referensiService.groupDiklat();
    topicDiklatList$: Observable<any[]> = this._referensiService.groupTopic();
    kategoriDiklat = [];
    onFileInputed: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<CreateSesiComponent>,
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
            title: [(this._data.section?.title) ? this._data.section?.title : '', [Validators.required]],
            summary: [(this._data.section?.description) ? this._data.section?.description : '', [Validators.required]],
            startDate: [this._data.section?.startDate, [Validators.required]],
            // endDate: [this._data.section?.endDate, [Validators.required]]
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
            courseId: this._data.id,
            title: formInput.title,
            summary: formInput.summary,
            startDate: moment(formInput.startDate).format('YYYY-MM-DD'),
            endDate: moment(formInput.startDate).format('YYYY-MM-DD')
        };
        if(this._data.section){
            params.id = this._data.section.id;
        }

        if(this._data.section){
            this._diklatService.sectionModify(JSON.stringify(params)).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Sesi `' + formInput.title + '` berhasil diubah');
                        this.form.reset();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        } else {
            this._diklatService.sectionCreate(JSON.stringify(params)).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Sesi `' + formInput.title + '` berhasil ditambahkan');
                        this.form.reset();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        }
    }

    clearFileInput(formName) {
        this.form.get(formName).setValue(null);
        const el = (document.getElementById(formName) as HTMLImageElement);
        el.src = 'assets/images/no_image.png';
    }

    readFileAsync(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    onFileInput(event, formName) {
        const mimes = ['image/jpeg', 'image/jpg', 'image/png'];
        const file = event.target.files[0];
        const size = Math.round(file.size / Math.pow(1024, 1));
        const mime = mimes.find(element => element === file.type);
        if (size > 2000) {
            this._toastr.warning('Ukuran maksimum file tidak boleh lebih dari 2MB', 'ERROR');
        }
        if (!mime) {
            this._toastr.warning('Format file tidak sesuai, format file harus: *.png, *.jpg atau *.jpeg', 'ERROR');
        }

        this.form.get(formName).setValue(file);
        const data = this.readFileAsync(file);
        data.then((photo: any) => {
            const el = (document.getElementById(formName) as HTMLImageElement);
            if (el) {
                el.src = photo;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
