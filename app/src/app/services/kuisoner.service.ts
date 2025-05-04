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
export class KuisonerService {
    _apiUrl = `${environment.apiUrl}`;
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



    getListKuisoner(page: number = 0, size: number = 1000, search: object = {}):
        Observable<any> {
        let params = {
            withPaginated: {
                page: '' + page,
                size: '' + size,
                sortField : null,
                sortOrder : null
            }
        };
        params = { ...params, ...search };
        return this._httpClient.post<{ pagination: any; items: any[] }>(this._apiUrl + '/quiz/kuisoner-bucket/filter', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
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

  

    detailKuisoner(id): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/quiz/kuisoner/' + id).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result?.success) {
                    return throwError('error!');
                }
                this._item.next(result.mapData.bucket);
                return of(result);
            })
        );
    }

    create(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/quiz/create-bucket', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }
        createKuisoner(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/quiz/create-kuisoner', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

    save(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/quiz/modify-bucket', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('save error!');
                }
                return of(result);
            })
        );
    }
        saveKuisoner(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/quiz/modify-kuisoner', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('save error!');
                }
                return of(result);
            })
        );
    }

    clone(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/quiz/clone-bucket', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('comment error!');
                }
                return of(result);
            })
        );
    }

    delete(id):
        Observable<any> {
        return this._httpClient.delete<any>(this._apiUrl + '/quiz/delete-bucket/' + id).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('delete error!');
                }
                return of(result);
            })
        );
    }

    addQuestionKuisoner(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/quiz/add-questionKuisoner', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('add question error!');
                }
                return of(result);
            })
        );
    }



    editQuestionKuisoner(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/quiz/modify-questionKuisoner', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('save error!');
                }
                return of(result);
            })
        );
    }




        deleteQuestionKuisoner(id):
        Observable<any> {
        return this._httpClient.delete<any>(this._apiUrl + '/quiz/delete-questionKuisoner/' + id).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('delete error!');
                }
                return of(result);
            })
        );
    }

    setBucketStatus(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/quiz/set-bucket-status/', JSON.stringify(params), { headers: this.httpHeaders });
    }
    setBucketStatusKuisoner(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/quiz/setKuisoner-bucket-status/', JSON.stringify(params), { headers: this.httpHeaders });
    }

}
