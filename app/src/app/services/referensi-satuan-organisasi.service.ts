/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class ReferensiSatuanOrganisasiService {
    _apiUrl = `${environment.apiUrl}`;
    httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });

    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _item: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _items$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _itemUnitKerja$: BehaviorSubject<any | null> = new BehaviorSubject(null);
    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
    }

    get pagination$(): Observable<any> {
        return this._pagination.asObservable();
    }

    get item$(): Observable<any> {
        return this._item.asObservable();
    }

    get items$(): Observable<any[]> {
        return this._items$.asObservable();
    }

    get itemUnitKerja$(): Observable<any> {
        return this._itemUnitKerja$.asObservable();
    }

    getList(params = {}, draw: number = 0, perPage: number = 10):
        Observable<{ pagination: any; items: any[] }> {
        return this._httpClient.get<{ pagination: any; items: any[] }>(this._apiUrl + '/refference/satuan-organisasi', { params }).pipe(
            tap((response: any) => {
                const _items = response;
                const firstCut = draw * perPage;
                const secondCut = firstCut + perPage;
                const items = _items.slice(firstCut, secondCut);
                this._items$.next(items);
                this._pagination.next({ recordsTotal: response.length, perPage, draw });
            })
        );
    }

    getUnitKerja(params = {}):
        Observable<{ pagination: any; items: any[] }> {
        return this._httpClient.get<{ pagination: any; items: any[] }>(this._apiUrl + '/refference/unit-kerja', { params }).pipe(
            tap((response: any) => {
                this._itemUnitKerja$.next(response);
            })
        );
    }

    getById(id: string): Observable<any> {
        return this.items$.pipe(
            take(1),
            map((items) => {
                const _item = items.find(item => item.id === id) || null;
                this.getUnitKerja({satuanOrganisasiId: _item.id}).subscribe();
                this._item.next(_item);
                return _item;
            }),
            switchMap((_item) => {
                if (!_item) {
                    return throwError('Tidak dapat menemukan data dengan id #' + id + '!');
                }
                return of(_item);
            })
        );
    }

    save(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/write-reff/satuan-organisasi/save', params).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

    delete(id: string): Observable<boolean> {
        return this.items$.pipe(
            take(1),
            switchMap(items => this._httpClient.delete(this._apiUrl + '/write-reff/satuan-organisasi/delete/' + id).pipe(
                map((isDeleted: boolean) => {
                    const index = items.findIndex(item => item.id === id);
                    items.splice(index, 1);
                    this._items$.next(items);
                    return isDeleted;
                })
            ))
        );
    }

}
