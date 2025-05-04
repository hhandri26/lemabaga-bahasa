/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class VerifikasiRiwayatService {
    _apiUrl = `${environment.apiUrl}/profil/usul`;

    httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });
    uploadHttpHeaders = new HttpHeaders({
        'Accept': '*/*',
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });

    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);

    private _Items: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _Item: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get items$(): Observable<any[]> { return this._Items.asObservable(); }
    get item$(): Observable<any> { return this._Item.asObservable(); }

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
                this._Items.next(response.mapData.data.content);
            })
        );
    }

    getDetail(id: number):
        Observable<any> {
        return this._Items.pipe(
            take(1),
            map((items) => {
                const _item = items.find(item => item.id === id) || null;
                const rows: any[] = [];

                    const payloadResults: any[] = [];
                    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                    const payloadAfter = Object.keys(_item.payload).map(function(index) {
                        return _item.payload[index];
                    });
                    let i = 0;
                    _item.payloadBefore.forEach((row) => {
                        if (row.keyName === 'dokumenSkpId' || row.keyName === 'dokumenSuratPengantarId' || row.keyName === 'dokumenPakSebelumnya') {
                            payloadResults.push({ keyLabel: row.keyLabel, before: row.keyValue, after: payloadAfter[i]['keyValue'], isDownload: true });
                        } else {
                            payloadResults.push({ keyLabel: row.keyLabel, before: row.keyValue, after: payloadAfter[i]['keyValue'], isDownload: false });
                        }

                        i++;
                    });
                    rows.push(
                        {
                            'id': _item.id,
                            'dokumenId': _item.dokumenId,
                            'jenisUsul': _item.jenisUsul,
                            'namaJenisUsul': _item.namaJenisUsul,
                            'actionName': _item.actionName,
                            'createdDate': moment(_item.createdDate).fromNow(),
                            'pns': _item.pns,
                            'payload': payloadResults
                        }
                    );
                this._Item.next(rows[0]);
                return rows[0];
            }),
            switchMap((item) => {
                if (!item) {
                    return throwError('Tidak dapat menemukan id #' + id + '!');
                }
                return of(item);
            })
        );
    }

    saveUndangan(body: FormData):
        Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
    }

    approval(body: FormData):
        Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/approval', body).pipe(
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

    getListById(id: string): Observable<any> {
        return this._Items.pipe(
            take(1),
            map((items) => {
                const _item = items.find(item => item.id === id) || null;
                this._Item.next(_item);
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
