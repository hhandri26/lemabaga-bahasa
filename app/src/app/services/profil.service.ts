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
export class ProfilService {
    _apiUrl = `${environment.apiUrl}/profil`;

    private _inboxs: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _inbox: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
    }

    get inboxs$(): Observable<any[]> {
        return this._inboxs.asObservable();
    }

    get inbox$(): Observable<any[]> {
        return this._inbox.asObservable();
    }

    get pagination$(): Observable<any> {
        return this._pagination.asObservable();
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

    createUsul(formData):
        Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/create-usul', formData).pipe();
    }

    approveUsul(formData):
        Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/approval-usul', formData).pipe();
    }

    usul(page: number = 0, size: number = 10, sort: string = 'nama', order: 'asc' | 'desc' | '' = 'asc', search: object = {}):
        Observable<any> {
        let params = {
            page: '' + page,
            size: '' + size,
            sortedBy: sort,
            orderBy: order
        };
        params = { ...params, ...search };
        return this._httpClient.post<{ pagination: any; items: any[] }>(this._apiUrl + '/inbox', params).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._inboxs.next(response.data);
            })
        );
    }

    getInboxById(id: string): Observable<any> {
        return this._inboxs.pipe(
            take(1),
            map((items) => {
                const _item = items.find(item => item.usulId === id) || null;
                this._inbox.next(_item);
                return _item;
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('Tidak dapat menemukan id #' + id + '!');
                }
                return of(item);
            })
        );
    }

    preview(id): Observable<any> {
        return this._httpClient.get<any[]>(this._apiUrl + `/dokumen/${id}`,
            this.__HTTPHeaderBlob(this._authService.accessToken, 'blob')
        ).pipe(
            map((response: any) => response)
        );
    }

    getKAK(id_usul): Observable<any> {
		return this._httpClient.get<any>(this._apiUrl + '/konversi-angka-kredit/hasil/' + id_usul);
	}

	reprocessKAK(id_usul): Observable<any> {
		return this._httpClient.get<any>(this._apiUrl + '/konversi-angka-kredit/reprocess/' + id_usul);
	}

	correctingKAK(params): Observable<any> {
		return this._httpClient.post<any>(this._apiUrl + '/konversi-angka-kredit/correcting/' + params.id, {params});
	}

    cetakKAK(params): Observable<any> {
        return this._httpClient.post<any>(`${environment.apiUrl}/report/result-kak`, params, this.__HTTPHeaderBlob(this._authService.accessToken, 'blob')).pipe(
          result => result
        );
      }
}
