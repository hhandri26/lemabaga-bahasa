/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ForumService } from 'app/services/forum.service';
import { KuisonerService } from 'app/services/kuisoner.service';

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
    groupDiklatList = this._referensiService.groupDiklat();
    topicDiklatList = this._referensiService.groupTopic();
    onFileInputed: boolean = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    tipeSurvei$: Observable<any[]> = this._referensiService.tipeSurvei();

    constructor(
        public matDialogRef: MatDialogRef<CreateComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _kuisonerService: KuisonerService,
    ) { }

    ngOnInit(): void {
        console.log('this._data', this._data);
        this.form = this._formBuilder.group({
            courseGroupId: [this._data?.courseGroup.id ?? ''],
            // courseTopicId: [this._data?.courseTopicId ?? '', [Validators.required]],
            name: [this._data?.name ?? '', [Validators.required]],
            tipeSurvei: [null, Validators.required],
            type: [this._data?.type ?? 'SURVEY', [Validators.required]],
            questionType: [this._data?.questionType ?? 'PG', [Validators.required]],
            durationInMinutes: [this._data?.durationInMinutes ?? 10000, [Validators.required]],
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    create(): void {
        const formInput: any = this.form.getRawValue();
        const params: any = {
            name: formInput.name,
            type: formInput.type,
            courseGroupId: formInput.courseGroupId,
            tipeSurvei:formInput.tipeSurvei,
            questionType: formInput.questionType,
            durationInMinutes: formInput.durationInMinutes,
        };
        if(this._data?.id){
            params.id = this._data?.id;
            this._kuisonerService.saveKuisoner(params).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Kelompok soal berhasil diubah');
                        this.form.reset();
                        this._kuisonerService.getListKuisoner().subscribe();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        } else {
            this._kuisonerService.createKuisoner(params).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Kelompok soal berhasil ditambahkan');
                        this.form.reset();
                        this._kuisonerService.getListKuisoner().subscribe();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
