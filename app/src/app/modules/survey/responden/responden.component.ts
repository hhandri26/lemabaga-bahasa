/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS, ReferensiService } from 'app/services/referensi.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, debounceTime, distinctUntilChanged, fromEvent, takeUntil, tap } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { QuizService } from 'app/services/quiz.service';
import moment from 'moment';
import { SurveyService } from 'app/services/survey.service';
import { MatTableDataSource } from '@angular/material/table';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from 'app/services/user.service';

@Component({
    templateUrl: './responden.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class RespondenComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('filterByNama', { static: true }) findNama: ElementRef;
    form: FormGroup;
    dataSource = new MatTableDataSource<any>();
    displayedColumns = ['select', 'nama', 'jabatanNama', 'role'];
    length = null;
    pageSize = 10;
    hideListJFP: boolean = false;
    pesertaList: any[] = [];
    selectedPeserta: any[] = [];

    roles$: Observable<any[]> = this._referensiService.roles();
    filterByRole: any = '';

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<RespondenComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        private _formBuilder: UntypedFormBuilder,
        public _helperService: HelperService,
        private _referensiService: ReferensiService,
        private _toastr: ToastrService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _surveyService: SurveyService,
        private _penerjemahService: PenerjemahService,
        private _userService: UserService
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            surveyId: [this._data.id],
        });
    }

    ngAfterViewInit(): void {
        this._changeDetectorRef.markForCheck();
        fromEvent(this.findNama.nativeElement, 'keyup')
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(150),
                distinctUntilChanged(),
                tap(() => {
                    this.paginator.pageIndex = 0;
                    this._changeDetectorRef.markForCheck();
                    this.filter();
                })
            )
            .subscribe();

        this.filter();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    fetchJfp() {
        const filters: any = {
            'byRole': (this.filterByRole) ? this.filterByRole : null,
            'byName': (this.findNama.nativeElement.value) ? this.findNama.nativeElement.value : null,
            // 'byIsUserExisted': true,
            // 'size': 10000,
            // 'page': 0
        };
        return this._userService.getList(0, 10000, 'name', 'ASC', filters).pipe(
            takeUntil(this._unsubscribeAll)
        );
    }

    filter() {
        this.fetchJfp().subscribe((items: any) => {
            if (items?.content) {
                this.pesertaList = items.content;
                this.dataSource = new MatTableDataSource(items.content);
                this.dataSource.paginator = this.paginator;
                this.length = items.totalElements;
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    exists(item) {
        return this.selectedPeserta.find(selected => selected.id === item.id);
    }

    isIndeterminate() {
        return (this.selectedPeserta.length > 0 && !this.isChecked());
    }

    toggle(item, event: MatCheckboxChange) {
        if (event.checked) {
            if (!this.selectedPeserta.find(selected => selected.id === item.id)) {
                this.selectedPeserta.push(item);
            }
        } else {
            const index = this.selectedPeserta.map(selected => selected.id).indexOf(item.id);
            this.selectedPeserta.splice(index, 1);
        }
    }

    toggleAll(event: MatCheckboxChange) {
        if (event.checked) {
            this.pesertaList.forEach((row) => {
                this.selectedPeserta.push(row);
            });
        } else {
            this.selectedPeserta.length = 0;
        }
    }

    isChecked() {
        return this.selectedPeserta.length === this.pesertaList.length;
    }

    onChangeForAllJFP(ob: MatSlideToggleChange) {
        this.hideListJFP = (ob.checked) ? true : false;
        this._changeDetectorRef.detectChanges();
    }

    create(): void {
        const formInput: any = this.form.getRawValue();
        const params: any = {
            surveyId: formInput.surveyId,
        };
        // console.log(this.selectedPeserta);
        if (this.selectedPeserta.length > 0) {
            const participants = [];
            this.selectedPeserta.forEach((item) => {
                participants.push({
                    'userId': item.id,
                    'participantType': 'PFP'
                });
            });
            params.participants = participants;
        }

        this._surveyService.addParticipant(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Responden berhasil ditambah');
                    this.form.reset();
                    this._surveyService.getList().subscribe();
                    this.matDialogRef.close(true);
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
