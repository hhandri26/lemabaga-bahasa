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
import { QuizService } from 'app/services/quiz.service';
import moment from 'moment';
// import { SurveyService } from 'app/services/survey.service';
import { KuisonerService } from 'app/services/kuisoner.service';
import { SurveyKuisonerService } from 'app/services/survey-kuisoner.service';

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
    kuisonerList$: Observable<any[]>;
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
        private _surveyService: SurveyKuisonerService,
    ) { }

    ngOnInit(): void {
        console.log('this._data', this._data);
        this.form = this._formBuilder.group({
            title: [this._data?.title ?? '', [Validators.required]],
            startDate: [this._data?.startDate, [Validators.required]],
            endDate: [this._data?.endDate, [Validators.required]],
            tipeSurvei: [this._data?.tipeSurvei, [Validators.required]],
            bucketId: [this._data?.bucketId, [Validators.required]],
            titleCertificate: [this._data?.titleCertificate ?? 'Judul Sertifikat', [Validators.required]],
            subtitleCertificate: [this._data?.subtitleCertificate ?? 'Sub Judul Sertifikat', [Validators.required]],
            timeCertificate: [this._data?.timeCertificate ?? '09:00', [Validators.required]],
            dateCertificate: [this._data?.dateCertificate ?? new Date(), [Validators.required]],
            placeCertificate: [this._data?.placeCertificate ?? 'Jakarta', [Validators.required]],
            typeCertificate: [this._data?.typeCertificate ?? '1', [Validators.required]],
            studyHours: [this._data?.studyHours ?? 0, [Validators.required]],
        });

        this._kuisonerService.getListKuisoner(0, 1000, {
            byStatus: 'PUBLISHED'
       }).subscribe(response => {
    console.log('Response from getListKuisoner:', response);
});
        
        this.kuisonerList$ = this._kuisonerService.items$;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    create(): void {
        const formInput: any = this.form.getRawValue();
        const body = new FormData();
        body.append('title', formInput.title);
        body.append('bucketId', formInput.bucketId.id);
        body.append('tipeSurvei', formInput.tipeSurvei);
        body.append('startDate', moment(formInput.startDate).format('YYYY-MM-DD'));
        body.append('endDate', moment(formInput.endDate).format('YYYY-MM-DD'));

        const titleCertificate = formInput.titleCertificate || 'Sertifikat Survey';
        const dateCertificate = formInput.dateCertificate ? moment(formInput.dateCertificate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
        const timeCertificate = formInput.timeCertificate || '09:00';
        const placeCertificate = formInput.placeCertificate || 'Jakarta';
        const typeCertificate = formInput.typeCertificate || '1';

        body.append('titleCertificate', titleCertificate);
        body.append('dateCertificate', dateCertificate);
        body.append('subtitleCertificate', formInput.subtitleCertificate);
        body.append('timeCertificate', timeCertificate);
        body.append('placeCertificate', placeCertificate);
        body.append('typeCertificate', typeCertificate);
        body.append('studyHours', formInput.studyHours);
        
        if(this._data?.id){
            body.append('id', this._data?.id);
            this._surveyService.save(body).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Survey berhasil diubah');
                        this.form.reset();
                        this._kuisonerService.getListKuisoner().subscribe();
                        this.matDialogRef.close(true);
                    } else {
                        this._toastr.error(result?.message, 'ERROR');
                    }
                }
            );
        } else {
            this._surveyService.create(body).subscribe(
                (result) => {
                    if (result?.success) {
                        this._toastr.success('Survey berhasil ditambahkan');
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
