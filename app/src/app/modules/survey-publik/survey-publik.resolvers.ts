import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { SurveyKuisonerService } from 'app/services/survey-kuisoner.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class PublikStartResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _surveyKuisonerService: SurveyKuisonerService, 
        private _router: Router,
        private _toastr: ToastrService
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        const hash = route.paramMap.get('hash');
        console.log('Resolving route with hash:', hash);
        
        return this._surveyKuisonerService.start(hash).pipe(
            catchError((error) => {
                console.error('Error in resolver:', error);
                
                // Extract error message
                let errorMessage = 'Survey tidak valid atau sudah kadaluarsa';
                
                if (error?.error?.message) {
                    errorMessage = error.error.message;
                } else if (error?.message) {
                    errorMessage = error.message;
                }
                
                // Show error toastr
                this._toastr.error(errorMessage);
                
                const parentUrl = state.url.split('/').slice(0, -1).join('/');
                this._router.navigateByUrl(parentUrl);
                return throwError(error);
            })
        );
    }
}