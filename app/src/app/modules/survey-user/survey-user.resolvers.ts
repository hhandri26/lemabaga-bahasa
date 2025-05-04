import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { SurveyService } from 'app/services/survey.service';

@Injectable({
    providedIn: 'root'
})
export class StartResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _surveyService: SurveyService, private _router: Router) {
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
        return this._surveyService.start(route.paramMap.get('id'))
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
