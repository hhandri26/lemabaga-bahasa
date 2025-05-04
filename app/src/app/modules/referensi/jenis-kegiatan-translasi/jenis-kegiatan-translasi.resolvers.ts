import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { ReferensiKegiatanTranslasiService } from 'app/services/referensi-kegiatan-translasi.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ListResolver implements Resolve<any>
{
    constructor(private _referensiKegiatanTranslasiService: ReferensiKegiatanTranslasiService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: any; items: any[] }> {
        return this._referensiKegiatanTranslasiService.getList();
    }
}


@Injectable({
    providedIn: 'root'
})
export class DetailResolver implements Resolve<any>
{
    constructor(
        private _referensiKegiatanTranslasiService: ReferensiKegiatanTranslasiService,
        private _router: Router
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._referensiKegiatanTranslasiService.getById(route.paramMap.get('id'))
            .pipe(
                catchError((error) => {
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');
                    this._router.navigateByUrl(parentUrl);
                    return throwError(error);
                })
            );
    }
}
