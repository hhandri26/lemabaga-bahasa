/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit, ChangeDetectionStrategy, ElementRef, QueryList, ViewChildren, AfterViewInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { FuseCardComponent } from '@fuse/components/card';
import { BeritaService } from 'app/services/berita.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-berita',
    templateUrl: './berita.component.html',
    styles: [
        `
            cards fuse-card {
                margin: 16px;
            }
        `
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BeritaComponent implements OnInit, AfterViewInit {
    @ViewChildren(FuseCardComponent, { read: ElementRef }) private _fuseCards: QueryList<ElementRef>;

    filters: string[] = ['semua', 'pengumuman', 'berita'];
    numberOfCards: any = {};
    selectedFilter: string = 'semua';
    announcements$: Observable<any[]>;
    announcement$: Observable<any>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _beritaService: BeritaService,
        private _changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this._beritaService.getList().subscribe();

        this.announcements$ = this._beritaService.announcements$;
        // this._announcementService.announcements$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((announcements: any[]) => {
        //         if (announcements) {
        //             announcements.forEach((element) => {
        //                 if(element?.source_image){
        //                     this.getImgPreview(element.id, element.source_image.id);
        //                 }
        //             });
        //         }
        //         this._changeDetectorRef.markForCheck();
        //     });

    }

    detail(id){
        this._beritaService.getDetail(id).subscribe();
        this.announcement$ = this._beritaService.announcement$;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On filter change
     *
     * @param change
     */
    onFilterChange(change: MatButtonToggleChange): void {
        this.selectedFilter = change.value;
        this._filterCards();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _calcNumberOfCards(): void {
        this.numberOfCards = {};

        let count = 0;

        this.filters.forEach((filter) => {

            if (filter === 'semua') {
                count = this._fuseCards.length;
            }
            else {
                count = this.numberOfCards[filter] = this._fuseCards.filter(fuseCard => fuseCard.nativeElement.classList.contains('filter-' + filter)).length;
            }
            this.numberOfCards[filter] = count;
        });
    }

    downloadAttachFile(id) {
        this._beritaService.previewDocument(id).subscribe((blob: any) => {
            if (blob) {
                const fileURL = URL.createObjectURL(blob);
                window.open(fileURL, '_blank');
            }
        });
    }

    private _filterCards(): void {
        this._fuseCards.forEach((fuseCard) => {
            if (this.selectedFilter === 'semua') {
                fuseCard.nativeElement.classList.remove('hidden');
            }
            else {
                if (fuseCard.nativeElement.classList.contains('filter-' + this.selectedFilter)) {
                    fuseCard.nativeElement.classList.remove('hidden');
                }
                else {
                    fuseCard.nativeElement.classList.add('hidden');
                }
            }
        });
    }

    ngAfterViewInit(): void {
        this._calcNumberOfCards();
        this._filterCards();
    }
}
