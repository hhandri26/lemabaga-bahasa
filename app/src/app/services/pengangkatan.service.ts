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
export class PengangkatanService {
    _apiUrl = `${environment.apiUrl}/pengangkatan`;

    httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });
    uploadHttpHeaders = new HttpHeaders({
        'Accept': '*/*',
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });

    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _items: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _item: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get items$(): Observable<any[]> { return this._items.asObservable(); }
    get item$(): Observable<any> { return this._item.asObservable(); }

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
                this._pagination.next({ recordsTotal: response.totalElements, perPage: response.size, draw: response.number });
                this._items.next(response.content);
            })
        );
    }

    getById(id: number): Observable<any> {
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

    saveUsul(isDraft, body: FormData):
        Observable<any> {
        if (isDraft) {
            return this._httpClient.post<any>(this._apiUrl + '/create-usul', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        } else {
            return this._httpClient.post<any>(this._apiUrl + '/save-usul', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
        }
    }

    submitUsul(body: FormData):
        Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/submit-usul', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
    }

    returnUsulan(params):
        Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/return-usul', params).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('return usulan error!');
                }
                return of(result);
            })
        );
    }

    sendSk(body: FormData):
        Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/send-sk-usul', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
    }

    sendRekomendasi(body: FormData):
        Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/send-recommendation-usul', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
    }

    setComplete(body: FormData):
        Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/set-complete', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
    }

    getRekap(draw: number = 0, perPage: number = 10):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/get-rekap').pipe(
            tap((response: any) => {
                const _items = response;
                const firstCut = draw * perPage;
                const secondCut = firstCut + perPage;
                const items = _items.slice(firstCut, secondCut);
                this._items.next(items);
                this._pagination.next({ recordsTotal: response.length, perPage, draw });
            })
        );
    }

    getDetail(id: number):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/detail/' + id).pipe(
            take(1),
            switchMap((_item) => {
                if (!_item) {
                    return throwError('Tidak dapat menemukan detail usulan pengangkatan dengan id #' + id + '!');
                }
                return of(_item);
            })
        );
    }

    getRekapExists(params):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/get-formasi-exists', { params }).pipe(
            take(1),
            switchMap(_item => of(_item))
        );
    }

    getHistory(id: number):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/history/' + id).pipe(
            take(1),
            map((response) => {
                if (response?.success) {
                    return response.mapData.events;
                }
            }),
            switchMap((_item) => {
                if (!_item) {
                    return throwError('Tidak dapat menemukan history usulan formasi dengan id #' + id + '!');
                }
                return of(_item);
            })
        );
    }

    cetak(id): Observable<any> {
        return this._httpClient.get<any>(`${this._apiUrl}/dokumen/` + id, this.__HTTPHeaderBlob(this._authService.accessToken, 'blob')).pipe(
            map((response: any) => response)
        );
    }

    getListById(id: string): Observable<any> {
        return this._items.pipe(
            take(1),
            map((items) => {
                const _item = items.find(item => item.id === id) || null;
                this._item.next(_item);
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
