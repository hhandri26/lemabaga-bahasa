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
export class ReferensiPelatihanService {
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

getList(params = { q: '' }, draw: number = 0, perPage: number = 10): Observable<{ pagination: any; items: any[] }> {
    return this._httpClient.get<any[]>(this._apiUrl + '/refference/pelatihan', { params }).pipe(
        tap((response: any) => {
            // Log the entire response from the API
            console.log('API Response:', response);

            // Ensure 'content' exists and is an array
            const _items = Array.isArray(response) ? response : []; // Update this line
            console.log('Items extracted:', _items);

            const firstCut = draw * perPage;
            const secondCut = firstCut + perPage;
            const items = _items.slice(firstCut, secondCut);
            console.log('Paginated items:', items);

            // Update the BehaviorSubject with the new items and pagination
            this._items$.next(items);
            this._pagination.next({ recordsTotal: response.totalElements || 0, perPage, draw });
        }),
    );
}


    getById(id: string): Observable<any> {
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
        return this._httpClient.post<any>(this._apiUrl + '/write-reff/pelatihan/save', params).pipe(
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
            switchMap(items => this._httpClient.delete(this._apiUrl + '/write-reff/pelatihan/delete/' + id).pipe(
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
