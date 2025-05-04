import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { DiklatService } from 'app/services/diklat.service';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DiklatCoursesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _diklatService: DiklatService,
        private _authService: AuthService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const role = this._authService.role;
        if (role === 'ROLE_USER') {
            return this._diklatService.getPlayList();
        }
        return this._diklatService.getList();
    }
}

@Injectable({
    providedIn: 'root'
})
export class DiklatCourseResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _diklatService: DiklatService,
        private _authService: AuthService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const role = this._authService.role;
        if (role === 'ROLE_USER') {
            return this._diklatService.getPlayById(route.paramMap.get('id'))
            .pipe(
                catchError((error) => {
                    console.error(error);
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');
                    this._router.navigateByUrl(parentUrl);
                    return throwError(error);
                })
            );
        }
        return this._diklatService.getById(route.paramMap.get('id'))
            .pipe(
                catchError((error) => {
                    console.error(error);
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');
                    this._router.navigateByUrl(parentUrl);
                    return throwError(error);
                })
            );
    }
}
