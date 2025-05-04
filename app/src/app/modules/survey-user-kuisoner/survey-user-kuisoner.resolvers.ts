import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { SurveyKuisonerService } from 'app/services/survey-kuisoner.service';

@Injectable({
    providedIn: 'root'
})
export class StartResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _surveyKuisonerService: SurveyKuisonerService, private _router: Router) {
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
    const hash = route.paramMap.get('id');
    console.log('Resolving route with hash:', hash);

    return this._surveyKuisonerService.start(hash).pipe(
        catchError((error) => {
            console.error('Error in resolver:', error);
            const parentUrl = state.url.split('/').slice(0, -1).join('/');
            this._router.navigateByUrl(parentUrl);
            return throwError(error);
        })
    );
}

}
