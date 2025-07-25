/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { HelperService } from 'app/services/helper.service';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { ReferensiService, YEAR_FORMATS } from 'app/services/referensi.service';
import moment, { Moment } from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, takeUntil, BehaviorSubject } from 'rxjs';
import { CertificateHistoryService } from 'app/modules/survey-kuisoner/sertifikat/history/certificate-history.service';
import { switchMap, take, map } from 'rxjs/operators'; // Import switchMap and take
import { of } from 'rxjs';
import { PdfGenerationService } from 'app/services/pdf-generation.service'; // Import PdfGenerationService

@Component({
    selector: 'app-pelatihan',
    templateUrl: './pelatihan.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: YEAR_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class PelatihanComponent implements OnInit, OnDestroy {
    rwPelatihan: any[] = [];
    rwUsuls: any[] = [];
    pnsId: string;
    selected: any | null = null;
    editMode: boolean = false;
    insertMode: boolean = false;
    onFileInputed: boolean = false; // Reintroduced
    form: FormGroup;
    lingkupPelatihan = this._referensiService.lingkupPelatihan();
    onChange = (year: Date) => { };
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    jenisPelatihan$: Observable<any[]> = this._referensiService.pelatihan();
    
    // Separate observables for insert and edit modes
    private _allCertificates$ = new BehaviorSubject<any[]>([]);
    sertifikatHistoryForInsert$: Observable<any[]>;
    sertifikatHistoryForEdit$: Observable<any[]>;
    
    certificateToGenerate: any | null = null; // New property for certificate data for PDF generation

    @ViewChild('hiddenCertificateForPdf', { static: false }) hiddenCertificateForPdf!: ElementRef;

    constructor(
        private _penerjemahService: PenerjemahService,
        private _referensiService: ReferensiService,
        private _helperService: HelperService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _toastr: ToastrService,
        private _authService: AuthService,
        private _userService: UserService,
        private _certificateHistoryService: CertificateHistoryService,
        private _pdfGenerationService: PdfGenerationService // Inject PdfGenerationService
    ) { 
        // Initialize filtered observables
        this.sertifikatHistoryForInsert$ = this._allCertificates$.pipe(
            map(certificates => certificates.filter(cert => !cert.isUsed))
        );

        this.sertifikatHistoryForEdit$ = this._allCertificates$.pipe(
            map(certificates => {
                if (!this.selected) return certificates.filter(cert => !cert.isUsed);
                
                return certificates.filter(cert => 
                    !cert.isUsed || 
                    (cert.isUsed && cert.rwPelatihanId === this.selected.id)
                );
            })
        );
    }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            nama: [null, Validators.required],
            tahun: [moment(), Validators.required],
            lingkupPelatihan: [null, Validators.required],
            institusi: [null, Validators.required],
            file: [null], // No initial required validator
            sertifikatId: [null], // No initial required validator
            pelatihanId: [null, Validators.required],
            nilai: [null, Validators.required],
            predikat: [null, Validators.required],
            peringkat: [null, Validators.required],
            jp: [null, Validators.required]
        });

        this.loadData();

        // Listen for changes in sertifikatId and file to update validators
        this.form.get('sertifikatId').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
            if (value) {
                this.form.get('file').clearValidators();
                this.form.get('file').updateValueAndValidity();
            }
        });

        this.form.get('file').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
            if (value) {
                this.form.get('sertifikatId').clearValidators();
                this.form.get('sertifikatId').updateValueAndValidity();
            }
        });

        // Set initial validators based on default onFileInputed state
        this._changeDetectorRef.detectChanges();
        setTimeout(() => {
            this.form.get('sertifikatId').updateValueAndValidity();
            this.form.get('file').updateValueAndValidity();

            if (this.onFileInputed) {
                this.form.get('file').setValidators(Validators.required);
                this.form.get('sertifikatId').clearValidators();
            } else {
                this.form.get('sertifikatId').setValidators(Validators.required);
                this.form.get('file').clearValidators();
            }
            this.form.get('file').updateValueAndValidity();
            this.form.get('sertifikatId').updateValueAndValidity();
        }, 0);
    }

    loadData() {
        if (this._authService.role === 'ROLE_ADMIN') {
            this._penerjemahService.jfpItem$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((item: any) => {
                    this.pnsId = item.id;
                    // Fetch sertifikat history for admin
                    this._certificateHistoryService.getAllCertificates().pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
                        this._allCertificates$.next(response.mapData.certificate || []);
                        this._changeDetectorRef.markForCheck();
                    });
                    this._changeDetectorRef.markForCheck();
                });
        } else {
            this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: any) => {
                this.pnsId = user.pnsId;
                // Fetch sertifikat history for regular user
                if (user.email) {
                    this._certificateHistoryService.getCertificates(user.email).pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
                        this._allCertificates$.next(response.mapData.certificate || []);
                        this._changeDetectorRef.markForCheck();
                    });
                }
                this._changeDetectorRef.markForCheck();
            });
        }

        this._penerjemahService.getRwPelatihan(this.pnsId).subscribe();

        this._penerjemahService.rwPelatihan$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: any) => {
                if (item) {
                    this.rwPelatihan = item;
                    this._changeDetectorRef.markForCheck();
                }
            });

        this._penerjemahService.getHistoriUsulProfil({
            pnsId: this.pnsId,
            jenisUsul: 'RW_PELATIHAN',
            size: 100
        }).pipe(takeUntil(this._unsubscribeAll)).subscribe((items: any) => {
            if (items) {
                this.rwUsuls = items;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    togglePrint(id) {
        this._penerjemahService.getDokumen(id).subscribe({
            next: (result) => {
                const fileURL = URL.createObjectURL(result);
                window.open(fileURL, '_blank');
            },
            error: () => {
                this._toastr.error('ERROR: Dokumen gagal ditampilkan', 'ERROR');
            }
        });
    }

    onFileInput(event) { // Reintroduced
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

    insert(): void {
        const formInput: any = this.form.getRawValue();
        const sertifikatId = formInput.sertifikatId;
        const uploadedFile = formInput.file;

        let saveObservable: Observable<any>;

        if (uploadedFile) {
            // Handle file upload
            const body = new FormData();
            body.append('pnsId', this.pnsId);
            if (formInput.pelatihanId) { body.append('pelatihanId', formInput.pelatihanId); }
            if (formInput.nilai) { body.append('nilai', formInput.nilai); }
            if (formInput.predikat) { body.append('predikat', formInput.predikat); }
            if (formInput.peringkat) { body.append('peringkat', formInput.peringkat); }
            if (formInput.jp) { body.append('jp', formInput.jp); }
            if (formInput.nama) { body.append('nama', formInput.nama); }
            if (formInput.tahun) { body.append('tahun', moment(formInput.tahun).format('YYYY')); }
            if (formInput.lingkupPelatihan) { body.append('lingkupPelatihan', formInput.lingkupPelatihan); }
            if (formInput.institusi) { body.append('institusi', formInput.institusi); }
            body.append('file', uploadedFile, uploadedFile.name);

            saveObservable = this._penerjemahService.saveRwPelatihan(body);
        } else if (sertifikatId) {
            // Handle certificate selection and PDF generation
            saveObservable = this._certificateHistoryService.getCertificateById(sertifikatId).pipe(
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
                                    this._pdfGenerationService.generatePdfFromHtml(hiddenEl, `sertifikat_${sertifikatId}.pdf`).subscribe({
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
                                const fileName = `sertifikat_${sertifikatId}.pdf`;
                                const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

                                const body = new FormData();
                                body.append('pnsId', this.pnsId);
                                if (formInput.pelatihanId) { body.append('pelatihanId', formInput.pelatihanId); }
                                if (formInput.nilai) { body.append('nilai', formInput.nilai); }
                                if (formInput.predikat) { body.append('predikat', formInput.predikat); }
                                if (formInput.peringkat) { body.append('peringkat', formInput.peringkat); }
                                if (formInput.jp) { body.append('jp', formInput.jp); }
                                if (formInput.nama) { body.append('nama', formInput.nama); }
                                if (formInput.tahun) { body.append('tahun', moment(formInput.tahun).format('YYYY')); }
                                if (formInput.lingkupPelatihan) { body.append('lingkupPelatihan', formInput.lingkupPelatihan); }
                                if (formInput.institusi) { body.append('institusi', formInput.institusi); }
                                if (formInput.sertifikatId) { body.append('certificateId', formInput.sertifikatId); }
                                body.append('file', file, fileName);

                                // Reset certificateToGenerate after use
                                this.certificateToGenerate = null;
                                this._changeDetectorRef.detectChanges();

                                return this._penerjemahService.saveRwPelatihan(body);
                            })
                        );
                    } else {
                        return of({ success: false, message: 'Certificate data not found.' });
                    }
                })
            );
        } else {
            this._toastr.error('Mohon pilih sertifikat atau unggah file.', 'ERROR');
            return;
        }

        saveObservable.subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Selanjutnya usulan Anda akan diverifikasi oleh Admin', 'Usulan Tambah Berhasil');
                    this.form.reset();
                    this.loadData();
                    this.toggleInsertMode(false);
                    this.toggleEditMode(false);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            },
            (error) => {
                this._toastr.error('Failed to process request', 'ERROR');
                console.error(error);
            }
        );
    }

    delete(): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus Data',
            'message': '<span class="font-medium">Tindakan ini tidak dapat dibatalkan!</span>',
            'icon': {
                'show': true,
                'name': 'heroicons_outline:x',
                'color': 'warn'
            },
            'actions': {
                'confirm': {
                    'show': true,
                    'label': 'Konfirm hapus',
                    'color': 'warn'
                },
                'cancel': {
                    'show': true,
                    'label': 'Batal'
                }
            },
            'dismissible': true
        });

        dialogRef.afterClosed().subscribe((_result) => {
            if (_result === 'confirmed') {
                this._penerjemahService.deleteRwPelatihan(this.selected.id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Selanjutnya usulan Anda akan diproses oleh Admin', 'Usulan Hapus Berhasil');
                            this.loadData();
                            this.toggleInsertMode(false);
                            this.toggleEditMode(false);
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    update(): void {
        const formInput: any = this.form.getRawValue();
        const sertifikatId = formInput.sertifikatId;
        const uploadedFile = formInput.file;

        let updateObservable: Observable<any>;

        if (uploadedFile) {
            // Handle file upload
            const body = new FormData();
            body.append('pnsId', this.pnsId);
            body.append('id', this.selected.id);
            if (formInput.nama) { body.append('nama', formInput.nama); }
            if (formInput.tahun) { body.append('tahun', moment(formInput.tahun).format('YYYY')); }
            if (formInput.lingkupPelatihan) { body.append('lingkupPelatihan', formInput.lingkupPelatihan); }
            if (formInput.institusi) { body.append('institusi', formInput.institusi); }
            if (formInput.pelatihanId) { body.append('pelatihanId', formInput.pelatihanId); }
            if (formInput.nilai) { body.append('nilai', formInput.nilai); }
            if (formInput.predikat) { body.append('predikat', formInput.predikat); }
            if (formInput.peringkat) { body.append('peringkat', formInput.peringkat); }
            if (formInput.jp) { body.append('jp', formInput.jp); }
            body.append('file', uploadedFile, uploadedFile.name);

            updateObservable = this._penerjemahService.saveRwPelatihan(body);
        } else if (sertifikatId) {
            // Handle certificate selection and PDF generation
            updateObservable = this._certificateHistoryService.getCertificateById(sertifikatId).pipe(
                take(1),
                switchMap((response: any) => {
                    if (response.success && response.mapData && response.mapData.certificate) {
                        this.certificateToGenerate = response.mapData.certificate;
                        this._changeDetectorRef.detectChanges(); // Ensure the hidden div is rendered

                        return new Observable<Blob>(observer => {
                            setTimeout(() => {
                                const hiddenEl = this.hiddenCertificateForPdf.nativeElement.querySelector('.certificate-bg.download-mode');
                                if (hiddenEl) {
                                    this._pdfGenerationService.generatePdfFromHtml(hiddenEl, `sertifikat_${sertifikatId}.pdf`).subscribe({
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
                                const fileName = `sertifikat_${sertifikatId}.pdf`;
                                const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

                                const body = new FormData();
                                body.append('pnsId', this.pnsId);
                                body.append('id', this.selected.id);
                                if (formInput.nama) { body.append('nama', formInput.nama); }
                                if (formInput.tahun) { body.append('tahun', moment(formInput.tahun).format('YYYY')); }
                                if (formInput.lingkupPelatihan) { body.append('lingkupPelatihan', formInput.lingkupPelatihan); }
                                if (formInput.institusi) { body.append('institusi', formInput.institusi); }
                                if (formInput.pelatihanId) { body.append('pelatihanId', formInput.pelatihanId); }
                                if (formInput.nilai) { body.append('nilai', formInput.nilai); }
                                if (formInput.predikat) { body.append('predikat', formInput.predikat); }
                                if (formInput.peringkat) { body.append('peringkat', formInput.peringkat); }
                                if (formInput.jp) { body.append('jp', formInput.jp); }
                                if (formInput.sertifikatId) { body.append('certificateId', formInput.sertifikatId); }
                                body.append('file', file, fileName);

                                // Reset certificateToGenerate after use
                                this.certificateToGenerate = null;
                                this._changeDetectorRef.detectChanges();

                                return this._penerjemahService.saveRwPelatihan(body);
                            })
                        );
                    } else {
                        return of({ success: false, message: 'Certificate data not found.' });
                    }
                })
            );
        } else {
            this._toastr.error('Mohon pilih sertifikat atau unggah file.', 'ERROR');
            return;
        }

        updateObservable.subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Selanjutnya usulan Anda akan diverifikasi oleh Admin', 'Usulan Perubahan Berhasil');
                    this.form.reset();
                    this.loadData();
                    this.toggleInsertMode(false);
                    this.toggleEditMode(false);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            },
            (error) => {
                this._toastr.error('Failed to process request', 'ERROR');
                console.error(error);
            }
        );
    }

    displayFn(item) {
        if (item) { return item.nama; }
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    chosenYearHandler(normalizedYear: Moment, _tahun: any) {
        const ctrlValue = this.form.get('tahun').value;
        ctrlValue.year(normalizedYear.year());
        this.form.get('tahun').setValue(ctrlValue);
        this._changeDetectorRef.markForCheck();
        _tahun.close();
    }

    toggleOnFileInputed(onFileInputed: boolean | null = null): void {
        if (onFileInputed === null) {
            this.onFileInputed = !this.onFileInputed;
        } else {
            this.onFileInputed = onFileInputed;
        }

        // Clear values and set validators based on the current state of onFileInputed
        if (this.onFileInputed) { // If file upload is selected
            this.form.get('sertifikatId').setValue(null);
            this.form.get('sertifikatId').clearValidators();
            this.form.get('file').setValidators(Validators.required);
            (document.getElementById('fileDokumen') as HTMLElement).innerText = null; // Clear file name display
        } else { // If certificate selection is selected
            this.form.get('file').setValue(null);
            this.form.get('file').clearValidators();
            this.form.get('sertifikatId').setValidators(Validators.required);
        }

        this.form.get('sertifikatId').updateValueAndValidity();
        this.form.get('file').updateValueAndValidity();
        this._changeDetectorRef.markForCheck();
    }

    toggleInsertMode(insertMode: boolean | null = null): void {
        if (insertMode === null) {
            this.insertMode = !this.insertMode;
        } else {
            this.insertMode = insertMode;
        }
        
        // Reset form and file input state when toggling insert mode
        if (this.insertMode) {
            this.form.reset();
            this.form.get('tahun').setValue(moment());
            this.onFileInputed = false;
        }
        
        this._changeDetectorRef.markForCheck();
    }

    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        } else {
            this.editMode = editMode;
        }

        // When entering edit mode, check if current record uses a certificate
        if (this.editMode && this.selected && this.selected.certificateId) {
            this.onFileInputed = false; // Default to certificate selection
            this.form.get('sertifikatId').setValue(this.selected.certificateId);
            // Trigger observable update for edit mode filtering
            this._allCertificates$.next(this._allCertificates$.value);
        }

        this._changeDetectorRef.markForCheck();
    }

    toggleDetails(id: string): void {
        if (this.selected && this.selected.id === id) {
            this.closeDetails();
            return;
        }

        this._penerjemahService.getRwPelatihanById(id)
            .subscribe((item) => {
                this.selected = item;
                this.form.patchValue(item);
                this.form.get('tahun').setValue(moment(this._helperService.getDateFromStringID('01-01-' + item.tahun)));
                
                // Update filtered observables when selected item changes
                this._allCertificates$.next(this._allCertificates$.value);
                
                this._changeDetectorRef.markForCheck();
            });
    }

    closeDetails(): void {
        this.selected = null;
        // Reset filtered observables when no item is selected
        this._allCertificates$.next(this._allCertificates$.value);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    formatDate(dateArray: number[] | undefined): string {
        if (!dateArray || dateArray.length < 3) {
            return '';
        }
        const [year, month, day] = dateArray;
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    formatTime(timeArray: number[] | undefined): string {
        if (!timeArray || timeArray.length < 3) {
            return '';
        }
        const [hour, minute, second] = timeArray;
        return `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`;
    }

    // Helper method to get the appropriate certificate observable based on mode
    getSertifikatHistory$(): Observable<any[]> {
        return this.editMode ? this.sertifikatHistoryForEdit$ : this.sertifikatHistoryForInsert$;
    }
}