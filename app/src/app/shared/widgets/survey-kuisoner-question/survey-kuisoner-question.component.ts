/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Component, ChangeDetectionStrategy, OnInit, Input, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DiklatService } from 'app/services/diklat.service';
import { SurveyKuisonerService } from 'app/services/survey-kuisoner.service';
import { CertificateHistoryService } from 'app/modules/survey-kuisoner/sertifikat/history/certificate-history.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, take, takeUntil, of, switchMap } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PdfGenerationService } from 'app/services/pdf-generation.service';
import { EmailService } from 'app/services/email.service';
import * as moment from 'moment';

@Component({
    selector: 'app-widget-survey-kuisoner-question',
    templateUrl: './survey-kuisoner-question.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyKuisonerQuestionComponent implements OnInit, OnDestroy {
    @Input() item: any;
    questions: any;
    questionAnswer: any = [];
    formGroup: FormGroup;
    isTestActive: boolean = true;
    sessionTest: any;
    participantType: any;
    certificateToGenerate: any;
    @ViewChild('hiddenCertificateForPdf') hiddenCertificateForPdf: ElementRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private diklatService: DiklatService,
        private surveyKuisonerService: SurveyKuisonerService,
        private _changeDetectorRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private _toastr: ToastrService,
        private activeRoute: ActivatedRoute,
        private route: Router,
        private _pdfGenerationService: PdfGenerationService,
        private _emailService: EmailService,
        private _certificateHistoryService: CertificateHistoryService
    ) { }

    ngOnInit(): void {
        this.questions = this.item.questionFeedbacks;
        this.activeRoute.queryParamMap.subscribe(queryParams => {
            this.participantType = queryParams.get('participantType') ?? '';
          });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    end(): void {
        const params = {
            hash: this.activeRoute.snapshot.url[1].path
        };
        
        this.surveyKuisonerService.endSurveyKuisoner(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            if (response.success) {
                this._toastr.success('Survey telah disubmit');
                this._changeDetectorRef.markForCheck();
                
                // Ambil data dari response
                const participantType = response.mapData?.participantType;
                const certificateId = response.mapData?.certificateId;
                
                // Gunakan data dari response untuk logic selanjutnya
                if (participantType !== 'OTHERS') {
                    this.route.navigate(['/survey-user-kuisoner']);
                } else {
                    // Gunakan certificateId dari response untuk handleOthersParticipantType
                    this.handleOthersParticipantType(certificateId);
                }
            } else {
                this._toastr.error(response?.message, 'ERROR');
            }
        });
    }

    handleOthersParticipantType(certificateId?: number): void {
        // Gunakan certificateId dari parameter jika ada, jika tidak gunakan dari URL seperti sebelumnya
        const certId = certificateId.toString();
        
        this._certificateHistoryService.getCertificateById(certId).pipe(
            take(1),
            switchMap((response: any) => {
                if (response.success && response.mapData && response.mapData.certificate) {
                    this.certificateToGenerate = response.mapData.certificate;
                    this._changeDetectorRef.detectChanges(); // Ensure the hidden div is rendered
    
                    return new Observable<Blob>(observer => {
                        // A small delay to ensure the DOM is ready for html2canvas
                        setTimeout(() => {
                            const hiddenEl = this.hiddenCertificateForPdf.nativeElement.querySelector('.certificate-bg.download-mode');
                            if (hiddenEl) {
                                this._pdfGenerationService.generatePdfFromHtml(hiddenEl, `sertifikat_${certId}.pdf`).subscribe({
                                    next: (blob) => observer.next(blob),
                                    error: (err) => observer.error(err),
                                    complete: () => observer.complete()
                                });
                            } else {
                                observer.error('Hidden certificate element not found for PDF generation.');
                            }
                        }, 100); // Small delay
                    }).pipe(
                        switchMap((pdfBlob: Blob) => {
                            const recipientEmail = this.certificateToGenerate.email; // Assuming email is available in certificate data
                            const subject = 'Sertifikat Pelatihan'; // You can customize this
                            const messageBody = 'Terlampir sertifikat pelatihan Anda.'; // You can customize this
    
                            return this._emailService.sendCertificateEmail(recipientEmail, subject, messageBody, pdfBlob).pipe(
                                switchMap(emailResponse => {
                                    if (emailResponse.success) {
                                        this._toastr.success('Sertifikat berhasil dikirim melalui email');
                                        this.route.navigate(['/survey-publik-end']);
                                        return of(emailResponse);
                                    } else {
                                        this._toastr.error(emailResponse?.message, 'ERROR');
                                        return of(emailResponse);
                                    }
                                })
                            );
                        })
                    );
                } else {
                    return of({ success: false, message: 'Certificate data not found.' });
                }
            })
        ).subscribe({
            next: () => {
                // Reset certificateToGenerate after use
                this.certificateToGenerate = null;
                this._changeDetectorRef.detectChanges();
            },
            error: (err) => {
                this._toastr.error('Gagal memproses sertifikat: ' + err, 'ERROR');
                // Reset certificateToGenerate on error as well
                this.certificateToGenerate = null;
                this._changeDetectorRef.detectChanges();
            }
        });
    }

save(answer, questionId, isianAnswer): void {
    // Prepare the parameters
    const params = {
        hash: this.activeRoute.snapshot.url[1].path,  // Token hash
        questionId: questionId,  // ID of the question
        answer: null,  // Placeholder for answer, you can update if needed
        optionAnswer: [answer.value],  // Multiple options, if any
        // isianAnswer: isianAnswer  // Pass the ISIAN answer here
    };

    // Call the service to save the survey answer
    this.surveyKuisonerService.answerSurveyKuisoner(params)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            // Handle the response after saving the answer
            if (response.success) {
                this._toastr.success('Jawaban berhasil disimpan');
                this._changeDetectorRef.markForCheck();  // Mark for change detection
            } else {
                this._toastr.error(response?.message, 'ERROR');  // Show error message
            }
        });
}
saveIsian(answer, questionId, isianAnswer): void {
    // Prepare the parameters
    const params = {
        hash: this.activeRoute.snapshot.url[1].path,  // Token hash
        questionId: questionId,  // ID of the question
        answer: null,  // Placeholder for answer, you can update if needed
        optionAnswer: [],  // Multiple options, if any
        isianAnswer: isianAnswer  // Pass the ISIAN answer here
    };

    // Call the service to save the survey answer
    this.surveyKuisonerService.answerSurveyKuisoner(params)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            // Handle the response after saving the answer
            if (response.success) {
                // this._toastr.success('Jawaban berhasil disimpan');
                this._changeDetectorRef.markForCheck();  // Mark for change detection
            } else {
                this._toastr.error(response?.message, 'ERROR');  // Show error message
            }
        });
}
toggleAnswer(choice: any, question: any): void {
    // Set semua pilihan ke false, hanya yang diklik ke true
    question.question.options.forEach((opt: any) => {
        opt.isAnswer = (opt === choice);
    });

    // Siapkan parameter untuk backend (hanya satu jawaban)
    const selectedChoice = question.question.options.find((opt: any) => opt.isAnswer);
    const params = {
        hash: this.activeRoute.snapshot.url[1].path,  // Token hash
        questionId: question.question.questionId,  // ID of the question
        likechartAnswer: selectedChoice ? [selectedChoice.label] : [],  // Kirim satu jawaban
        isianAnswer: null,  // Null karena bukan tipe ISIAN
    };

    this.surveyKuisonerService.answerSurveyKuisoner(params)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
            if (response.success) {
                this._toastr.success('Jawaban berhasil disimpan');
                this._changeDetectorRef.markForCheck();
            } else {
                this._toastr.error(response?.message, 'ERROR');
            }
        });
}

formatDate(dateArray: number[] | undefined): string {
    if (!dateArray || dateArray.length < 3) {
        return '';
    }
    const [year, month, day] = dateArray;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}




}
