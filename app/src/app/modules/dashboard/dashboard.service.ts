import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import moment from 'moment';
import { BehaviorSubject, map, Observable, of, switchMap, tap, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    _apiUrl = `${environment.apiUrl}/dashboard`;

    private _gender: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _agama: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _tkPendidikan: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _age: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _tmtCpns: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _diklatStruktural: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _jenisJabatan: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _golongan: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) {
    }

    get gender$(): Observable<any> { return this._gender.asObservable(); }
    get agama$(): Observable<any> { return this._agama.asObservable(); }
    get age$(): Observable<any> { return this._age.asObservable(); }
    get tkPendidikan$(): Observable<any> { return this._tkPendidikan.asObservable(); }
    get golongan$(): Observable<any> { return this._golongan.asObservable(); }
    get tmtCpns$(): Observable<any> { return this._tmtCpns.asObservable(); }
    get diklatStruktural$(): Observable<any> { return this._diklatStruktural.asObservable(); }
    get jenisJabatan$(): Observable<any> { return this._jenisJabatan.asObservable(); }

    all():
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl).pipe(
            tap((response) => {
                if (response?.success) {
                    this._tmtCpns.next(response.mapData);
                }
            })
        );
    }

}
