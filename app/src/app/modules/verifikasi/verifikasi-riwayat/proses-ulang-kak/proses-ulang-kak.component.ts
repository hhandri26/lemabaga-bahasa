/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, Inject, OnDestroy, AfterViewInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HelperService } from 'app/services/helper.service';
import { DATE_FORMATS } from 'app/services/referensi.service';
import { Subject, takeUntil } from 'rxjs';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormasiService } from 'app/services/formasi.service';

@Component({
    templateUrl: './proses-ulang-kak.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    ]
})
export class ProsesUlangKakComponent implements OnInit, OnDestroy {

    items: [] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public matDialogRef: MatDialogRef<ProsesUlangKakComponent>,
        @Inject(MAT_DIALOG_DATA) public _data: any,
        public _helperService: HelperService,
        private _formasiService: FormasiService,
    ) { }

    ngOnInit(): void {
        this._formasiService.getRekapExists({instansiId: this._data.id.instansiId, jabatanId: this._data.id.jabatanId}).pipe(takeUntil(this._unsubscribeAll)).subscribe((items) => {
            console.log(items);
            this.items = items;
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
