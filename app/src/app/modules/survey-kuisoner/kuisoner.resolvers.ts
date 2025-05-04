import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { ReferensiForumService } from 'app/services/referensi-forum.service';
import { ReferensiService } from 'app/services/referensi.service';
import { ForumService } from 'app/services/forum.service';
import { KuisonerService } from 'app/services/kuisoner.service';

@Injectable({
    providedIn: 'root'
})
export class JenisForumResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _referensiService: ReferensiService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._referensiService.jenisForum();
    }
}

@Injectable({
    providedIn: 'root'
})
export class KuisoneresResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _kuisonerService: KuisonerService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._kuisonerService.getListKuisoner();
    }
}

@Injectable({
    providedIn: 'root'
})
export class KuisonerDetailResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _kuisonerService: KuisonerService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._kuisonerService.detailKuisoner(route.paramMap.get('id'));
    }
}
