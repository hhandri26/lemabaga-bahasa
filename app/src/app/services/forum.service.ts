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
export class ForumService {
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

    getList(page: number = 0, size: number = 1000, search: object = {}):
        Observable<any> {
        let params = {
            page: '' + page,
            size: '' + size
        };
        params = { ...params, ...search };
        return this._httpClient.post<{ pagination: any; items: any[] }>(this._apiUrl + '/forum/filter', params).pipe(
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

    detail(id): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/forum/detail/' + id).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('error!');
                }
                this._item.next(result);
                return of(result);
            })
        );
    }

    create(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/forum/create-thread', params).pipe(
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
        return this._httpClient.post<any>(this._apiUrl + '/forum/save-thread', params).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('save error!');
                }
                return of(result);
            })
        );
    }

    comment(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/forum/comment-thread', params).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('comment error!');
                }
                return of(result);
            })
        );
    }

    vote(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/forum/vote-thread', params).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('vote error!');
                }
                return of(result);
            })
        );
    }

    like(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/forum/like-comment-thread', params).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('like error!');
                }
                return of(result);
            })
        );
    }

    detailPost(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/forum/posts', params, { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('detail post error!');
                }
                return of(result);
            })
        );
    }

    detailReplies(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/forum/posts/replies', params, { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('detail replies error!');
                }
                return of(result);
            })
        );
    }

    changeStatus(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/forum/change-status-thread', params).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('update status error!');
                }
                return of(result);
            })
        );
    }

    delete(id):
        Observable<any> {
        return this._httpClient.delete<any>(this._apiUrl + '/forum/delete/' + id).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('delete error!');
                }
                return of(result);
            })
        );
    }
}
