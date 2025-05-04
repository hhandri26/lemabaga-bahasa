/* eslint-disable @typescript-eslint/no-shadow */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { ForumService } from 'app/services/forum.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { content } from '../../../../../tailwind.config';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'diklat-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent implements OnInit, OnDestroy {
    @ViewChild('expandable') expandable: any;
    // @ViewChild('postFormComment') postFormComment: any;
    item$: Observable<any[]>;
    posts$: Observable<any[]>;
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
        @Inject(DOCUMENT) private _document: Document,
        private route: ActivatedRoute,
        private _elementRef: ElementRef,
        private _forumService: ForumService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _toastr: ToastrService
    ) {
    }

    ngOnInit(): void {
        this.fetch();
    }

    fetch(): void {
        this.route.params.subscribe((params) => {
            this._forumService.detail(params.id).subscribe();
            this.item$ = this._forumService.item$;
        });
    }

    fetchAll(): void {
        this.route.params.subscribe((params) => {
            this._forumService.detail(params.id).subscribe();
            this.posts$ = this._forumService.detailPost(JSON.stringify({
                'forumId': params.id,
                'page': 0,
                'size': 1000
            }));
        });
    }

    toggleReply(postId): void {
        this.replyFormActive = postId;
        setTimeout(() => {
            this._elementRef.nativeElement.scrollTop = this._elementRef.nativeElement.scrollHeight;
        });
    }

    discard(): void {
        this.replyFormActive = false;
    }

    submitComment(content, forumId, isReply, replyTo): void {
        const body = new FormData();
        body.append('forumId', forumId);
        body.append('isReply', isReply);
        if (isReply) {
            body.append('replyTo', replyTo);
        }
        body.append('content', content);
        this._forumService.comment(body).subscribe((result: any) => {
            if (result?.success) {
                this.postFormComment.reset();
                this.replyFormComment.reset();
                this.fetchAll();
            } else {
                this._toastr.error(result?.message, 'ERROR');
            }
        });
    }

    openToggle(item): void {
        if (this.expandable.expanded) {
            this.posts$ = this._forumService.detailPost(JSON.stringify({
                'forumId': item.id,
                'page': 0,
                'size': 1000
            }));
        }
    }

    openCommentToggle(item): void {
        if(this.commentActive === item.id){
            this.commentActive = false;
        } else {
            this.commentActive = item.id;
            this.comments$ = this._forumService.detailReplies(JSON.stringify({
                'postId': item.id,
                'page': 0,
                'size': 1000
            }));
        }
    }

    toggleVote(id): void {
        const body = new FormData();
        body.append('forumId', id);
        this._forumService.vote(body).subscribe((result: any) => {
            if (result?.success) {
                this.route.params.subscribe((params) => {
                    this._forumService.detail(params.id).subscribe();
                });
            } else {
                this._toastr.error(result?.message, 'ERROR');
            }
        });
    }

    toggleLike(postId): void {
        const body = new FormData();
        body.append('postId', postId);
        this._forumService.like(body).subscribe((result: any) => {
            if (result?.success) {
                this.fetchAll();
            } else {
                this._toastr.error(result?.message, 'ERROR');
            }
        });
    }

    getFilePath(file): any {
        if (file !== null) {
            return environment.baseUrl + file;
        } else {
            return './assets/images/cards/01-320x200.jpg';
        }
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
