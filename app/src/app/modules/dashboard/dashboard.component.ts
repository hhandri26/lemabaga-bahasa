import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { environment } from 'environments/environment';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
    @ViewChild('drawer') drawer: MatDrawer;
    
    user: User;
    role: string = this._authService.role;
    pnsDetail: any = null;
    baseUrl = environment.baseUrl;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
    constructor(
        private _userService: UserService,
        private _authService: AuthService,
        private _penerjemahService: PenerjemahService,
        private _changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this._userService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user: any) => {
            this.user = user;
        });
        // this._userService.setRole(user.roles[0]).subscribe();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    
    /**
     * Buka drawer detail PNS
     *
     * @param pnsId ID PNS yang dipilih
     */
    openPnsDetail(pnsId: string): void {
        const scrollY = window.scrollY;
        // Ambil data PNS berdasarkan ID
        this._penerjemahService.getDataUtama(pnsId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response) => {
                    this.pnsDetail = response;
                    this.drawer.open();
                    window.scrollTo(0, scrollY);
                    this._changeDetectorRef.detectChanges();

                    // Subscribe to drawer close event
                    this.drawer.closedStart.subscribe(() => {
                        window.scrollTo(0, scrollY);
                    });
                },
                error: (error) => {
                    console.error('Error loading PNS data:', error);
                }
            });
    }
}
