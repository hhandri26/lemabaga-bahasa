/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { FormasiService } from 'app/services/formasi.service';
import { KegiatanService } from 'app/services/kegiatan.service';
import { ReferensiService } from 'app/services/referensi.service';
import { VerifikasiRiwayatService } from 'app/services/verifikasi-riwayat.service';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy {
    user: User;
    jenisUsulan: any[] = this._referensiService.jenisUsulan();
    actionUsulan: any[] = this._referensiService.actionUsulan();
    kegiatanItems$: Observable<any[]>;
    formasiItems$: Observable<any[]>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _referensiService: ReferensiService,
        private _userService: UserService,
        private _verifikasiRiwayatService: VerifikasiRiwayatService,
        private _formasiService: FormasiService,
        private _kegiatanService: KegiatanService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: any) => {
            this.user = user;
            console.log(user);
            this._kegiatanService.getListUndangan(0, 10, { byPnsId: user.pnsId }).subscribe();
            this.kegiatanItems$ = this._kegiatanService.kegiatanItems$;

            this._kegiatanService.kegiatanItems$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe();
            this._changeDetectorRef.markForCheck();
        });
    }

    toggleOpenFile(fileUndanganUrl) {
        window.open(fileUndanganUrl, '_blank');
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return String(item.id) || String(index);
    }
}
