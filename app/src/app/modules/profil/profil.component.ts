import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { environment } from 'environments/environment';
@Component({
    selector: 'app-profil',
    templateUrl: './profil.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilComponent implements OnInit, OnDestroy {
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'pribadi';
    user: User;
    // totalJp: number;
    pnsId: string;
    jabatanId: string; // Tambahkan properti untuk jabatanId jika dibutuhkan
    // nilaiAkKonversi: any; // Properti untuk menyimpan nilai AK Konversi
    baseUrl = environment.baseUrl;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _userService: UserService,
        private _penerjemahService: PenerjemahService,
    ) {}

    ngOnInit(): void {
        this.panels = [
            { id: 'pribadi', title: 'Data Utama' },
            { id: 'jabatan', title: 'Riwayat Jabatan' },
            { id: 'golongan', title: 'Riwayat Pangkat / Golongan' },
            { id: 'mutasi', title: 'Riwayat Mutasi' },
            { id: 'pendidikan', title: 'Riwayat Pendidikan Tinggi' },
            { id: 'pelatihan', title: 'Riwayat Pelatihan' },
            { id: 'uji_kompetensi', title: 'Riwayat Uji Kompetensi' },
            { id: 'kegiatan_penerjemahan', title: 'Riwayat Kegiatan Penerjemahan' },
            { id: 'angka_kredit', title: 'Riwayat Angka Kredit' },
            { id: 'penguasaan_bahasa', title: 'Riwayat Kemahiran Berbahasa' },
        ];

        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: any) => {
            this.pnsId = user.pnsId;
            this.jabatanId = user.jabatanId; // Pastikan jabatanId diambil jika tersedia
            this.fetchData();
        });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                this.drawerMode = matchingAliases.includes('lg') ? 'side' : 'over';
                this.drawerOpened = matchingAliases.includes('lg');
                this._changeDetectorRef.markForCheck();
            });
    }

    fetchData(): void {
    this._penerjemahService.getDataUtama(this.pnsId).subscribe();

    // this._penerjemahService.getTotalJp(this.pnsId).subscribe(
    //     (jp: number) => {
    //         this.totalJp = jp || 0; // Jika jp undefined/null, set ke 0
    //         this._changeDetectorRef.markForCheck();
    //     },
    //     () => {
    //         this.totalJp = 0; // Jika ada error, set ke 0
    //         this._changeDetectorRef.markForCheck();
    //     }
    // );

    // this._penerjemahService.getNilaiAkKonversi(this.pnsId, this.jabatanId).subscribe(
    //     (nilaiAk: any) => {
    //         this.nilaiAkKonversi = nilaiAk || 0; // Jika nilaiAk undefined/null, set ke 0
    //         this._changeDetectorRef.markForCheck(); // Trigger change detection
    //     },
    //     () => {
    //         this.nilaiAkKonversi = 0; // Jika ada error, set ke 0
    //         this._changeDetectorRef.markForCheck();
    //     }
    // );

    this._penerjemahService.dataUtama$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((item: any) => {
            if (item) {
                this.user = item;
            }
            this._changeDetectorRef.markForCheck();
        });
}


    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    goToPanel(panel: string): void {
        this.selectedPanel = panel;
        this._changeDetectorRef.detectChanges();
        if (this.drawerMode === 'over') {
            this.drawer.close();
        }
    }

    getPanelInfo(id: string): any {
        return this.panels.find(panel => panel.id === id);
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
