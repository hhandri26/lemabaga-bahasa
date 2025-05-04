/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormasiService } from 'app/services/formasi.service';
import { ReferensiService } from 'app/services/referensi.service';
import { VerifikasiRiwayatService } from 'app/services/verifikasi-riwayat.service';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
    jenisUsulan: any[] = this._referensiService.jenisUsulan();
    actionUsulan: any[] = this._referensiService.actionUsulan();
    peremajaanItems$: Observable<any[]>;
    formasiItems$: Observable<any[]>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _referensiService: ReferensiService,
        private _verifikasiRiwayatService: VerifikasiRiwayatService,
        private _formasiService: FormasiService
    ) { }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this._formasiService.getList().subscribe();
        this._verifikasiRiwayatService.getList().subscribe();
        this.peremajaanItems$ = this._verifikasiRiwayatService.items$;
        this.formasiItems$ = this._formasiService.items$;
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    _jenisUsulan(id) {
        const _item = this.jenisUsulan.find(item => item.id === id) || null;
        return _item?.nama ?? '-';
    }

    _action(id) {
        const _item = this.actionUsulan.find(item => item.id === id) || null;
        return _item?.nama ?? '-';
    }
}
