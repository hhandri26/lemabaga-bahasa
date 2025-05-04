import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { VerifikasiRiwayatService } from 'app/services/verifikasi-riwayat.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ListResolver implements Resolve<any>
{
    constructor(private _verifikasiRiwayatService: VerifikasiRiwayatService) {
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ pagination: any; items: any[] }> {
        return this._verifikasiRiwayatService.getList();
    }
}
