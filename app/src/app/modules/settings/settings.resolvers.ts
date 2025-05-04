import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, Subject, takeUntil, throwError } from 'rxjs';
import { UserService } from 'app/services/user.service';

// @Injectable({
//     providedIn: 'root'
// })
// export class ListResolver implements Resolve<any>
// {
//     constructor(private _userService: UserService) {
//     }

//     // resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
//     //     // return this._userService.getList();
//     // }
// }

@Injectable({
    providedIn: 'root'
})
export class GetProfileResolver implements Resolve<any>
{
    constructor(
        private _userService: UserService,
        private _router: Router
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
        // return this._userService.getProfile().pipe(
        //     catchError((error) => {
        //         console.error(error);
        //         const parentUrl = state.url.split('/').slice(0, -1).join('/');
        //         this._router.navigateByUrl(parentUrl);
        //         return throwError(error);
        //     })
        // );
    }
}
