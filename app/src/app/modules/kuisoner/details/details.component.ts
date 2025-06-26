/* eslint-disable @typescript-eslint/no-shadow */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { KuisonerEditQuestionComponent } from '../edit-question/edit-question.component';
import { cloneDeep } from 'lodash';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { KuisonerService } from 'app/services/kuisoner.service';

@Component({
    selector: 'survei-details',
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

    // FormControl to hold the selected question type
    questionTypeControl = new FormControl('text'); // Default is 'text' (for short answer)

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private route: ActivatedRoute,
        private _kuisonerService: KuisonerService,
        private _toastr: ToastrService,
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.item$ = this._kuisonerService.item$;
    }

    // Update the addQuestionKuisoner method to handle different question types
    addQuestionKuisoner(item: any, questionRequest: any): void {
        const params: any = {
            bucketId: item.id,
            questionRequest: {
                ...questionRequest,
                type: this.questionTypeControl.value, // Include the selected question type
            }
        };
        this._kuisonerService.addQuestionKuisoner(params).subscribe(
            (result) => {
                if (result?.success) {
                    this._toastr.success('Pertanyaan berhasil ditambah');
                    this._kuisonerService.detailKuisoner(item.id).subscribe();
                } else {
                    this._toastr.error(result?.message, 'ERROR');
                }
            }
        );
    }

    editQuestion(bucket, question: any): void {
        // this._matDialog.open(KuisonerEditQuestionComponent, {
        //     autoFocus: false,
        //     data: {
        //         bucket: cloneDeep(bucket),
        //         questionRequest: cloneDeep(question)
        //     }
        // });
    }

    deleteQuestionKuisoner(no, id, bucketId): void {
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
                this._kuisonerService.deleteQuestionKuisoner(id).subscribe(
                    (result) => {
                        if (result?.success) {
                            this._toastr.success('Pertanyaan nomor ' + no + ' berhasil dihapus');
                            this._kuisonerService.detailKuisoner(bucketId).subscribe();
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
            this._kuisonerService.detailKuisoner(params.id).subscribe(() => {
                this.item$ = this._kuisonerService.item$;
                setTimeout(() => {
                    this._changeDetectorRef.markForCheck();
                });
            });
        });
    }

    fetchAll(): void {
        this.route.params.subscribe((params) => {
            this._kuisonerService.detailKuisoner(params.id).subscribe();
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
