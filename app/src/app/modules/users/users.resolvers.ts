import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { ReferensiService } from 'app/services/referensi.service';
import { UserService } from 'app/services/user.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UsersResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _usersService: UserService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: any; items: any[] }> {
        return this._usersService.getList();
    }
}


@Injectable({
    providedIn: 'root'
})
export class UserResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _userService: UserService,
        private _router: Router
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
        return this._userService.getById(route.paramMap.get('id'))
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


@Injectable({
    providedIn: 'root'
})
export class UserRoleResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _referensiService: ReferensiService,
        private _router: Router
    ) {
    }

    resolve(): Observable<any> {
        return this._referensiService.roles();
    }
}
