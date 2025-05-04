/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-shadow */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private currentUserSubject: BehaviorSubject<any>;
    public currentUser$: Observable<any>;
    _apiUrl = `${environment.apiUrl}/user`;
    httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });

    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _item: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _items$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _roles$: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _rwInstansis: BehaviorSubject<any | null> = new BehaviorSubject(null);


    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
        
    ) {
        this.currentUserSubject = new BehaviorSubject<any>(null); // Initialize with null or a default user
        this.currentUser$ = this.currentUserSubject.asObservable();
    }

    get pagination$(): Observable<any> {
        return this._pagination.asObservable();
    }

    get item$(): Observable<any> {
        return this._item.asObservable();
    }
    
    setCurrentUser(user: any) {
        this.currentUserSubject.next(user);
    }
    
    get items$(): Observable<any[]> {
        return this._items$.asObservable();
    }

    get roles$(): Observable<any[]> {
        return this._roles$.asObservable();
    }

    getList(page: number = 0, size: number = 10, sortField: string = 'name', sortOrder: 'ASC' | 'DESC' | '' = 'ASC', search: object = {}):
        Observable<{ pagination: any; items: any[] }> {
        const params = {
            page,
            size,
            sortOrder,
            sortField,
            filters: search // Include the search filters directly
        };
        return this._httpClient.post<{ pagination: any; items: any[] }>(this._apiUrl + '/filter', params).pipe(
            tap((response: any) => {
                this._pagination.next({ recordsTotal: response.totalElements, perPage: response.size, draw: response.number });
                this._items$.next(response.content);
            }),
            catchError((error) => {
                console.error('Error fetching user list', error);
                return throwError(error);
            })
        );
    }

    getById(id: string): Observable<any> {
        return this.items$.pipe(
            take(1),
            map((items) => {
                const _item = items.find(item => +item.id === +id) || null;
                this._item.next(_item);
                return _item;
            }),
            switchMap((_item) => {
                if (!_item) {
                    return throwError('Tidak dapat menemukan pengguna dengan id #' + id + '!');
                }
                return of(_item);
            })
        );
    }

    save(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/save', params).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

    // getRwInstansi(id: string):
    //     Observable<any> {
    //     return this._httpClient.get<any>(this._apiUrl + '/profil/rw-instansi/' + id).pipe(
    //         tap((response) => {
    //             if (response?.success) {
    //                 this._rwInstansis.next(response.mapData.data);
    //             }
    //         })
    //     );
    // }
    getRwInstansi(pnsid: string): Observable<any> {
    // Assuming the new endpoint does not include `/user` and is something like `/profil/rw-instansi/`
    const newApiUrl = `${environment.apiUrl}/profil/rw-instansi/${pnsid}`;
    
    return this._httpClient.get<any>(newApiUrl).pipe(
        tap((response) => {
            if (response?.success) {
                this._rwInstansis.next(response.mapData.data);
            }
        })
    );
}

    
    reset_password(email: string, username: string): Observable<any> {
        return this._httpClient.post<any>(`${environment.apiUrl}/auth/reset-password`, { email, username }, { params: { email, username }, headers: this.httpHeaders });
    }

    change_password(queryParams): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/change-password', queryParams, { params: queryParams, headers: new HttpHeaders({
            'Authorization': 'Bearer ' + this._authService.accessToken,
        }) });
    }

    delete(id: string): Observable<boolean> {
        return this.items$.pipe(
            take(1),
            switchMap(items => this._httpClient.delete(this._apiUrl + '/delete/' + id).pipe(
                map((isDeleted: boolean) => {
                    const index = items.findIndex(item => item.id === id);
                    if (index > -1) {
                        items.splice(index, 1);
                        this._items$.next(items);
                    }
                    return isDeleted;
                })
            ))
        );
    }
}
