import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { ReferensiJenisSertifikatService } from 'app/services/referensi-jenis-sertifikat.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ListResolver implements Resolve<any>
{
    constructor(private _referensiJenisSertifikatService: ReferensiJenisSertifikatService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: any; items: any[] }> {
        return this._referensiJenisSertifikatService.getList();
    }
}


@Injectable({
    providedIn: 'root'
})
export class DetailResolver implements Resolve<any>
{
    constructor(
        private _referensiJenisSertifikatService: ReferensiJenisSertifikatService,
        private _router: Router
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._referensiJenisSertifikatService.getById(+route.paramMap.get('id'))
            .pipe(
                catchError((error) => {
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');
                    this._router.navigateByUrl(parentUrl);
                    return throwError(error);
                })
            );
    }
}
