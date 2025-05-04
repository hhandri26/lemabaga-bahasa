/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class KegiatanService {
    _apiUrl = `${environment.apiUrl}/kegiatan`;

    httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });
    uploadHttpHeaders = new HttpHeaders({
        'Accept': '*/*',
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });

    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _kegiatanItems: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _kegiatanItem: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get kegiatanItems$(): Observable<any[]> { return this._kegiatanItems.asObservable(); }
    get kegiatanItem$(): Observable<any> { return this._kegiatanItem.asObservable(); }

    get pagination$(): Observable<any> {
        return this._pagination.asObservable();
    }

    __HTTPHeaderUpload(token) {
        return new HttpHeaders(
            {
                // 'Content-Type': 'multipart/form-data',
                'Accept': '*/*',
                'Authorization': 'Bearer ' + token,
            });
    }

    __HTTPHeaderBlob(token, responseType: any) {
        return {
            headers: new HttpHeaders(
                {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }), responseType: responseType
        };
    }

    getList(page: number = 0, size: number = 10, search: object = {}):
        Observable<any> {
        let params = {
            page: '' + page,
            size: '' + size
        };
        params = { ...params, ...search };
        return this._httpClient.post<{ pagination: any; items: any[] }>(this._apiUrl + '/filter', params).pipe(
            tap((response) => {
                this._pagination.next({ recordsTotal: response.mapData.data.totalElements, perPage: response.mapData.data.size, draw: response.mapData.data.number });
                this._kegiatanItems.next(response.mapData.data.content);
            })
        );
    }

    getListUndangan(page: number = 0, size: number = 10, search: object = {}):
        Observable<any> {
        let params = {
            page: '' + page,
            size: '' + size
        };
        params = { ...params, ...search };
        return this._httpClient.post<{ pagination: any; items: any[] }>(this._apiUrl + '/undangan/filter', params).pipe(
            tap((response) => {
                this._pagination.next({ recordsTotal: response.mapData.data.totalElements, perPage: response.mapData.data.size, draw: response.mapData.data.number });
                this._kegiatanItems.next(response.mapData.data.content);
            })
        );
    }

    confirm(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/undangan/confirm', params);
    }

    getDetail(id: number):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/id/' + id).pipe(
            take(1),
            map((response) => {
                if (response?.success) {
                    return response.mapData.data;
                }
            }),
            switchMap((_item) => {
                if (!_item) {
                    return throwError('Tidak dapat menemukan kegiatan dengan id #' + id + '!');
                }
                return of(_item);
            })
        );
    }

    saveUndangan(body: FormData):
        Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
    }

    approvalUndangan(params):
        Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/undangan/confirmation-approval', params).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('approval error!');
                }
                return of(result);
            })
        );
    }

    deleteUndangan(id):
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

    cetak(id): Observable<any> {
        return this._httpClient.get<any>(`${environment.apiUrl}/report/undanganKegiatan/` + id, this.__HTTPHeaderBlob(this._authService.accessToken, 'blob')).pipe(
            map((response: any) => response)
        );
    }

    getListById(id: string): Observable<any> {
        return this._kegiatanItems.pipe(
            take(1),
            map((items) => {
                const _item = items.find(item => item.id === id) || null;
                this._kegiatanItem.next(_item);
                return _item;
            }),
            switchMap((_item) => {
                if (!_item) {
                    return throwError('Tidak dapat menemukan kegiatan dengan id #' + id + '!');
                }
                return of(_item);
            })
        );
    }
}
