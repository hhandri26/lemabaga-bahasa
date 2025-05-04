import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { ReferensiDiklatGroupService } from 'app/services/referensi-diklat-group.service';
import { ReferensiJenisSertifikatService } from 'app/services/referensi-jenis-sertifikat.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ListResolver implements Resolve<any>
{
    constructor(private _referensiDiklatGroupService: ReferensiDiklatGroupService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: any; items: any[] }> {
        return this._referensiDiklatGroupService.getList();
    }
}


@Injectable({
    providedIn: 'root'
})
export class DetailResolver implements Resolve<any>
{
    constructor(
        private _referensiDiklatGroupService: ReferensiDiklatGroupService,
        private _router: Router
    ) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._referensiDiklatGroupService.getById(+route.paramMap.get('id'))
            .pipe(
                catchError((error) => {
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');
                    this._router.navigateByUrl(parentUrl);
                    return throwError(error);
                })
            );
    }
}
