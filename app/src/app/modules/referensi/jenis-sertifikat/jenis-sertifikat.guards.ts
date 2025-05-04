import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DetailsComponent } from './details/details.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateDetails implements CanDeactivate<DetailsComponent>
{
    canDeactivate(
        component: DetailsComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        let nextRoute: ActivatedRouteSnapshot = nextState.root;
        while ( nextRoute.firstChild )
        {
            nextRoute = nextRoute.firstChild;
        }

        if ( !nextState.url.includes('/referensi-jenis-sertifikat') )
        {
            return true;
        }

        if ( nextRoute.paramMap.get('id') )
        {
            return true;
        }
        else
        {
            return component.closeDrawer().then(() => true);
        }
    }
}
