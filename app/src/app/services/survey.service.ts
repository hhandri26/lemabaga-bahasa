/* eslint-disable @typescript-eslint/explicit-function-return-type */
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
export class SurveyService {
    _apiUrl = `${environment.apiUrl}`;
    httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });

    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _paginationParticipant: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _item: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _items$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _itemParticipants$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
    }

    get pagination$(): Observable<any> {
        return this._pagination.asObservable();
    }

    get paginationParticipant$(): Observable<any> {
        return this._paginationParticipant.asObservable();
    }

    get item$(): Observable<any> {
        return this._item.asObservable();
    }

    get items$(): Observable<any[]> {
        return this._items$.asObservable();
    }

    get itemParticipants$(): Observable<any[]> {
        return this._itemParticipants$.asObservable();
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
        return this._httpClient.post<{ pagination: any; items: any[] }>(this._apiUrl + '/survey/filter', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((response) => {
                this._pagination.next({ recordsTotal: response.totalElements, perPage: response.size, draw: response.number });
                this._items$.next(response.content);
            })
        );
    }

    getListByMe():
        Observable<any> {
        return this._httpClient.get<{ pagination: any; items: any[] }>(this._apiUrl + '/survey/me', { headers: this.httpHeaders }).pipe(
            tap((response) => {
                this._pagination.next({ recordsTotal: response.mapData.survey.length, perPage: 10, draw: 1 });
                this._items$.next(response.mapData.survey);
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

    detail(id): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/survey/' + id).pipe(
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

    getListparticipant(id, draw: number = 0, perPage: number = 10):
        Observable<{ pagination: any; items: any[] }> {
        return this._httpClient.get<{ pagination: any; items: any[] }>(this._apiUrl + '/survey/participants/' + id).pipe(
            tap((response: any) => {
                const _items = response?.mapData.participants;
                const firstCut = draw * perPage;
                const secondCut = firstCut + perPage;
                const items = _items.slice(firstCut, secondCut);
                this._itemParticipants$.next(items);
                this._paginationParticipant.next({ recordsTotal: _items.length, perPage, draw });
            })
        );
    }

    download(id): Observable<any> {
        return this._httpClient.get<any>(`${this._apiUrl}/survey/download/` + id, this.__HTTPHeaderBlob(this._authService.accessToken, 'blob')).pipe(
            map((response: any) => response)
        );
    }

    start(hash): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/public/play-survey?hash=' + hash).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result?.success) {
                    return throwError('error!');
                }
                this._item.next(result.mapData.survey);
                return of(result);
            })
        );
    }

    end(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/public/end-survey', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result?.success) {
                    return throwError('error!');
                }
                this._item.next(result.mapData.survey);
                return of(result);
            })
        );
    }

    endSurvey(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/public/end-survey', params, { headers: this.httpHeaders });
    }

    answerSurvey(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/public/answer-survey', params, { headers: this.httpHeaders });
    }

    create(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/survey/create', params, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) }).pipe(
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
        return this._httpClient.post<any>(this._apiUrl + '/survey/modify', params, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('save error!');
                }
                return of(result);
            })
        );
    }

    delete(id): Observable<any> {
        const body = {
            id, 
            notes: 'remove'
        };
        
        return this._httpClient.post<any>(this._apiUrl + '/survey/remove', body, {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('save error!');
                }
                return of(result);
            })
        );
    }

    addParticipant(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/survey/add-participant', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

}
