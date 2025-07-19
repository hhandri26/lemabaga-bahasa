/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class SurveyKuisonerService {
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

    getListSurveiKuisoner(page: number = 0, size: number = 1000, search: object = {}):
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
        return this._httpClient.post<{ pagination: any; items: any[] }>(this._apiUrl + '/survey/filter-kuisoner', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((response) => {
                this._pagination.next({ recordsTotal: response.totalElements, perPage: response.size, draw: response.number });
                this._items$.next(response.content);
            })
        );
    }

    getListByMe():
        Observable<any> {
        return this._httpClient.get<{ pagination: any; items: any[] }>(this._apiUrl + '/survey/me-kuisoner', { headers: this.httpHeaders }).pipe(
            tap((response) => {
                this._pagination.next({ recordsTotal: response.mapData.surveyKuisoner.length, perPage: 10, draw: 1 });
                this._items$.next(response.mapData.surveyKuisoner);
            })
        );
    }

    getById(id: any): Observable<any> {
        return this.items$.pipe(
            take(1),
            map((items) => {
                // Ensure items is an array before calling find
                const _item = (items || []).find(item => item.id === id) || null;
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

    getBySurveyKuisonerId(id: string): Observable<any> {
        return this._httpClient.get<any>(`${this._apiUrl}/public/survey-kuisoner/${id}`).pipe(
            tap(result => console.log('Survey detail result:', result)),
            switchMap(result => {
                if (!result?.id) {
                    return throwError(() => new Error('Gagal mengambil detail survey'));
                }
    
                this._item.next(result); // langsung push seluruh result ke BehaviorSubject
                return of(result); // return result ke subscriber
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

    start(hash: string | null): Observable<any> {
    if (!hash) {
        console.error('Hash parameter is missing!');
        return throwError('Invalid hash parameter!');
    }

    return this._httpClient.get<any>(`${this._apiUrl}/public/play-survey-kuisoner?hash=${hash}`).pipe(
        tap((result) => {
            console.log('API Response:', result);
        }),
        switchMap((result) => {
            if (!result?.success) {
                console.error('API returned unsuccessful response:', result);
                return throwError('API returned unsuccessful response!');
            }
            if (!result.mapData?.surveyKuisoner) {
                console.error('Invalid survey data:', result.mapData);
                return throwError('Invalid survey data!');
            }
            this._item.next(result.mapData.surveyKuisoner);
            return of(result);
        }),
        catchError((error) => {
            console.error('Error in API call:', error);
            return throwError(error);
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

    endSurveyKuisoner(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/public/end-survey-kuisoner', params, { headers: this.httpHeaders });
    }

    answerSurveyKuisoner(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/public/answer-survey-kuisoner', params, { headers: this.httpHeaders });
    }

answerSurveyKuisonerIsian(params: any): Observable<any> {
    return this._httpClient.post<any>(this._apiUrl + '/public/answer-survey-kuisoner-isian', params, { headers: this.httpHeaders });
}

    create(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/survey/create-kuisoner', params, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) }).pipe(
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
        return this._httpClient.post<any>(this._apiUrl + '/survey/modify-kuisoner', params, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('save error!');
                }
                return of(result);
            })
        );
    }

delete(id: string): Observable<any> {
    const body = {
        id, 
        notes: 'remove'
    };
    
    return this._httpClient.post<any>(this._apiUrl + '/survey/remove-kuisoner', body, {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    }).pipe(
        tap((result: any) => result),
        switchMap((result) => {
            if (!result) {
                return throwError('Save error!');
            }
            return of(result);
        })
    );
}


    addParticipantKuisoner(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/survey/add-participant-kuisoner', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

    addPublicParticipantKuisoner(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/public/add-participant-kuisoner', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

    getSurveyStatistics(surveyKuisonerId: string): Observable<any> {
        return this._httpClient.get<any>(`${this._apiUrl}/survey-statistics/dashboard/${surveyKuisonerId}`).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('Error fetching survey statistics!');
                }
                return of(result);
            }),
            catchError((error) => {
                console.error('Error in getSurveyStatistics:', error);
                return throwError(error);
            })
        );
    }

    getSurveySuggestions(surveyKuisonerId: string): Observable<any> {
        return this._httpClient.get<any>(`${this._apiUrl}/survey-statistics/suggestions/${surveyKuisonerId}`).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('Error fetching survey suggestions!');
                }
                return of(result);
            }),
            catchError((error) => {
                console.error('Error in getSurveySuggestions:', error);
                return throwError(error);
            })
        );
    }

    updateFeedbackStatus(params: { feedbackId: string; status: string }): Observable<any> {
        return this._httpClient.post<any>(`${this._apiUrl}/survey/update-feedback-status`, params, { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result?.success) {
                    return throwError('Error updating feedback status!');
                }
                return of(result);
            }),
            catchError((error) => {
                console.error('Error in updateFeedbackStatus:', error);
                return throwError(error);
            })
        );
    }

}
