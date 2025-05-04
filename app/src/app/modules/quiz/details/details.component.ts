/* eslint-disable @typescript-eslint/no-shadow */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { QuizService } from 'app/services/quiz.service';
import { MatDialog } from '@angular/material/dialog';
import { QuizEditQuestionComponent } from '../edit-question/edit-question.component';
import { cloneDeep } from 'lodash';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'diklat-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent implements OnInit, OnDestroy {
    @ViewChild('expandable') expandable: any;
    item$: Observable<any[]>;
    comments$: Observable<any[]>;
    replyFormActive: boolean = false;
    commentActive: boolean = false;
    postFormComment = new FormControl('');
    replyFormComment = new FormControl('');

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private route: ActivatedRoute,
        private _quizService: QuizService,
        private _toastr: ToastrService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        this.item$ = this._quizService.item$;
    }

    addQuestion(item: any, questionRequest: any): void {
        const params: any = {
            bucketId: item.id,
            questionRequest
        };
        this._quizService.addQuestion(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Pertanyaan berhasil ditambah');
                    this._quizService.detail(item.id).subscribe();
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    editQuestion(bucket, question: any): void {
        this._matDialog.open(QuizEditQuestionComponent, {
            autoFocus: false,
            data: {
                bucket: cloneDeep(bucket),
                questionRequest: cloneDeep(question)
            }
        });
    }

    deleteQuestion(no, id, bucketId): void {
        const dialogRef = this._fuseConfirmationService.open({
            'title': 'Hapus Pertanyaan nomor.' + (no + 1),
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
                this._quizService.deleteQuestion(id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Pertanyaan nomor ' + no + ' berhasil dihapus');
                            this._quizService.detail(bucketId).subscribe();
                        } else {
                            this._toastr.error(result?.message, 'ERROR');
                        }
                    }
                );
            }
        });
    }

    fetch(): void {
        this.route.params.subscribe((params) => {
            this._quizService.detail(params.id).subscribe();
            this.item$ = this._quizService.item$;
            this._changeDetectorRef.markForCheck();
        });
    }

    fetchAll(): void {
        this.route.params.subscribe((params) => {
            this._quizService.detail(params.id).subscribe();
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

}
