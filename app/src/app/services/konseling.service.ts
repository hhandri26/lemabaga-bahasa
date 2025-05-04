/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class KonselingService {
    _apiUrl = `${environment.apiUrl}/konseling`;
    httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });
    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _item: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _items$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

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

    __HTTPHeaderUpload(token) {
        return new HttpHeaders(
            {
                // 'Content-Type': 'multipart/form-data',
                'Accept': '*/*',
                'Authorization': 'Bearer ' + token,
            });
    }

    getList(page: number = 0, size: number = 1000, search: object = {}):
        Observable<any> {
        let params = {
            withPaginated: {
                page: '' + page,
                size: '' + size,
                sortField: null,
                sortOrder: null
            }
        };
        params = { ...params, ...search };
        return this._httpClient.post<{ pagination: any; items: any[] }>(this._apiUrl + '/filter', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((response) => {
                this._pagination.next({ recordsTotal: response.totalElements, perPage: response.size, draw: response.number });
                this._items$.next(response.content);
            })
        );
    }

    getById(id: any): Observable<any> {
        return this.items$.pipe(
            take(1),
            map((items) => {
                const _item = items.find(item => item.id === id) || null;
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
        return this._httpClient.post<any>(this._apiUrl + '/save', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('save error!');
                }
                return of(result);
            })
        );
    }

    delete(id):
        Observable<any> {
        return this._httpClient.delete<any>(this._apiUrl + '/delete/' + id).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('delete error!');
                }
                return of(result);
            })
        );
    }

    finish(params: FormData): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/finish', params, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('save error!');
                }
                return of(result);
            })
        );
    }
}
