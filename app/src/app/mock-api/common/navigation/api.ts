import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { ROLE_ADMIN, ROLE_ADMIN_KEPEGAWAIAN_INSTANSI, ROLE_INSTRUKTUR, ROLE_USER } from 'app/mock-api/common/navigation/data';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class NavigationMockApi {
    private readonly _adminNavigation: FuseNavigationItem[] = ROLE_ADMIN;
    private readonly _userNavigation: FuseNavigationItem[] = ROLE_USER;
    private readonly _instansiNavigation: FuseNavigationItem[] = ROLE_ADMIN_KEPEGAWAIAN_INSTANSI;
    private readonly _instrukturNavigation: FuseNavigationItem[] = ROLE_INSTRUKTUR;

    /**
     * Constructor
     */
    constructor(
        private _fuseMockApiService: FuseMockApiService,
        private _authService: AuthService
    ) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void {
        // -----------------------------------------------------------------------------------------------------
        // @ Navigation - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/common/navigation')
            .reply(() => {
                let menu = cloneDeep(this._userNavigation);
                if (this._authService.role === 'ROLE_ADMIN') {
                    menu = cloneDeep(this._adminNavigation);
                } else if (this._authService.role === 'ROLE_ADMIN_KEPEGAWAIAN_INSTANSI') {
                    menu = cloneDeep(this._instansiNavigation);
                } else if (this._authService.role === 'ROLE_INSTRUKTUR') {
                    menu = cloneDeep(this._instrukturNavigation);
                }
                return [
                    200,
                    {
                        default: menu
                    }
                ];
            });
    }
}
