import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { KonselingService } from 'app/services/konseling.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ListResolver implements Resolve<any>
{
    constructor(private _konselingService: KonselingService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: any; items: any[] }> {
        return this._konselingService.getList();
    }
}
