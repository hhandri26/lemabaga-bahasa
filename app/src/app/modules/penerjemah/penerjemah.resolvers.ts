import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { PenerjemahService } from 'app/services/penerjemah.service';
import { catchError, Observable, throwError } from 'rxjs';
import { Pegawai } from './penerjemah.types';

@Injectable({
    providedIn: 'root'
})
export class JfpListResolver implements Resolve<any>
{
    constructor(private _penerjemahService: PenerjemahService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Pegawai[]> {
        return this._penerjemahService.getJfp();
    }
}

@Injectable({
    providedIn: 'root'
})
export class DataUtamaResolver implements Resolve<any>
{
    constructor(
        private _penerjemahService: PenerjemahService,
        private _router: Router
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._penerjemahService.getDataUtama(route.paramMap.get('id'))
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
export class JfpItemResolver implements Resolve<any>
{
    constructor(private _penerjemahService: PenerjemahService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._penerjemahService.getJfpById(route.paramMap.get('id'));
    }
}
