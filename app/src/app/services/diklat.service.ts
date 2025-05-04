/* eslint-disable max-len */
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
export class DiklatService {
    _apiUrl = `${environment.apiUrl}`;
    httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });

    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _items: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _item: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _itemPlay: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
    }

    get pagination$(): Observable<any> {
        return this._pagination.asObservable();
    }

    get items$(): Observable<any[]> { return this._items.asObservable(); }
    get item$(): Observable<any> { return this._item.asObservable(); }
    get itemPlay$(): Observable<any> { return this._itemPlay.asObservable(); }

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

    getList(withPaginated: object = {
        'page': 0,
        'size': 10,
        'sortField': 'startDate',
        'sortOrder': 'DESC'
    }):
        Observable<{ pagination: any; items: any[] }> {
        let params = {};
        params = { ...params, ...withPaginated };
        return this._httpClient.post<{ pagination: any; items: any[] }>(this._apiUrl + '/elearning/course/summary/filter', params).pipe(
            tap((response: any) => {
                this._pagination.next({ recordsTotal: response.totalElements, perPage: response.size, draw: response.number });
                this._items.next(response.content);
            })
        );
    }

    // AS USER
    getPlayList(withPaginated: object = {
        'page': 0,
        'size': 10,
        'sortField': 'startDate',
        'sortOrder': 'DESC'
    }):
        Observable<{ pagination: any; items: any[] }> {
        let params = {};
        params = { ...params, ...withPaginated };
        return this._httpClient.post<{ pagination: any; items: any[] }>(this._apiUrl + '/elearning/course-play/summary/filter', params).pipe(
            tap((response: any) => {
                this._pagination.next({ recordsTotal: response.totalElements, perPage: response.size, draw: response.number });
                this._items.next(response.content);
            })
        );
    }

    getPlayById(id: string):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/elearning/course-play/id/' + id).pipe(
            take(1),
            map((response) => {
                if (response?.success) {
                    this._item.next(response.mapData.data);
                    return response.mapData.data;
                }
            }),
            switchMap((_item) => {
                if (!_item) {
                    return throwError('Tidak dapat menemukan data id #' + id + '!');
                }
                return of(_item);
            })
        );
    }

    ///////////////////////////////////

    getCandidateList(params: any): Observable<{ pagination: any; items: any[] }> {
        return this._httpClient.post<{ pagination: any; items: any[] }>(this._apiUrl + '/elearning/course/candidate-participant/filter', JSON.stringify(params), { headers: this.httpHeaders }).pipe(
            map((response: any) => {
                if (response?.success) {
                    return response?.mapData?.participantCandidates;
                }
            }),
        );
    }

    getById(id: string):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/elearning/course/id/' + id).pipe(
            take(1),
            map((response) => {
                if (response?.success) {
                    this._item.next(response.mapData.data);
                    return response.mapData.data;
                }
            }),
            switchMap((_item) => {
                if (!_item) {
                    return throwError('Tidak dapat menemukan data id #' + id + '!');
                }
                return of(_item);
            })
        );
    }

    courseModify(body: FormData): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/modify', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

    save(body: FormData): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/create', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

    setTemplateCertificate(body: FormData): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/certificate/upload-template', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

    assignInstruktur(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/assign-instructure-test', body, { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

    addParticipant(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/add-participant', body, { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

    sendInvitation(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/participant/send-invitation', body, { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

    removeParticipant(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/participant/remove-participant', body, { headers: this.httpHeaders }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

    sectionCreate(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/section/create', body, { headers: this.httpHeaders });
    }

    sectionModify(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/section/modify', body, { headers: this.httpHeaders });
    }

    activityGroupCreate(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/activity-group/create', body, { headers: this.httpHeaders });
    }

    activityGroupModify(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/activity-group/modify', body, { headers: this.httpHeaders });
    }

    courseDocumentUpload(body: FormData): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/document/upload', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
    }

    courseDocumentDownload(id): Observable<any> {
        return this._httpClient.get<any>(`${this._apiUrl}/elearning/course/document/` + id, this.__HTTPHeaderBlob(this._authService.accessToken, 'blob')).pipe(
            map((response: any) => response)
        );
    }

    courseAttendanceDownload(id): Observable<any> {
        return this._httpClient.get<any>(`${this._apiUrl}/elearning/course/attendance/download/` + id, this.__HTTPHeaderBlob(this._authService.accessToken, 'blob')).pipe(
            map((response: any) => response)
        );
    }

    courseAssesmentDownload(id): Observable<any> {
        return this._httpClient.get<any>(`${this._apiUrl}/elearning/course/assessment/download/` + id, this.__HTTPHeaderBlob(this._authService.accessToken, 'blob')).pipe(
            map((response: any) => response)
        );
    }

    activityAttendance(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/activity/attendance/save', body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) });
    }

    activityURL(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/activity/url/save', body, { headers: this.httpHeaders });
    }

    activityMaterial(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/activity/material/save', body, { headers: this.httpHeaders });
    }

    activityAssignment(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/activity/assignment/save', body, { headers: this.httpHeaders });
    }

    assignCourseTest(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/assign-bucket-quiz', body, { headers: this.httpHeaders });
    }

    startPretest(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course-play/pretest/start', body, { headers: this.httpHeaders });
    }

    startPosttest(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course-play/posttest/start', body, { headers: this.httpHeaders });
    }

    answerPretest(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course-play/pretest/answer', body, { headers: this.httpHeaders });
    }

    answerPosttest(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course-play/posttest/answer', body, { headers: this.httpHeaders });
    }

    endPosttest(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course-play/posttest/end', body, { headers: this.httpHeaders });
    }

    endPretest(body): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course-play/pretest/end', body, { headers: this.httpHeaders });
    }

    getPretest(courseId): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/elearning/course-play/pretest/sessions/' + courseId, {
            headers: this.httpHeaders
        });
    }

    getPosttest(courseId): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/elearning/course-play/posttest/sessions' + courseId, {
            headers: this.httpHeaders
        });
    }

    getAssignmentTask(activityId): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/elearning/course/assignment/activity/' + activityId, {
            headers: this.httpHeaders
        });
    }

    getCourseDetail(courseId): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/elearning/course/id/' + courseId);
    }

    activityGroupDelete(activityId): Observable<any> {
        return this._httpClient.delete<any>(this._apiUrl + '/elearning/course/activity-group/delete/' + activityId);
    }

    sectionDelete(sectionId): Observable<any> {
        return this._httpClient.delete<any>(this._apiUrl + '/elearning/course/section/delete/' + sectionId);
    }

    activityDetailDelete(activityId): Observable<any> {
        return this._httpClient.delete<any>(this._apiUrl + '/elearning/course/activity/delete/' + activityId);
    }

    checkedActivity(activityId): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/elearning/course-play/checkin-out/activity/' + activityId);
    }

    courseDelete(courseId): Observable<any> {
        return this._httpClient.delete<any>(this._apiUrl + '/elearning/course/delete/' + courseId);
    }

    getPosition(): Promise<any> {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((resp) => {
                resolve({ lng: resp.coords.longitude, lat: resp.coords.latitude });
            },
                (err) => {
                    reject(err);
                });
        });
    }

    getLocation(lat, lon): Observable<any> {
        return this._httpClient.get<any>('https://nominatim.openstreetmap.org/reverse.php?format=json&lat=' + lat + '&lon=' + lon + '&zoom=18&format=jsonv2', { headers: this.httpHeaders }).pipe(map(res => res.display_name));
    }

    feedbackAttendance(body: FormData, role): Observable<any> {
        let url = 'course-play/feedback/attendance';
        if (role === 'ROLE_INSTRUKTUR') {
            url = 'course/attendance-instructure';
        }
        return this._httpClient.post<any>(this._apiUrl + '/elearning/' + url, body, { headers: this.__HTTPHeaderUpload(this._authService.accessToken) }).pipe(
            tap((result: any) => result),
            switchMap((result) => {
                if (!result) {
                    return throwError('created error!');
                }
                return of(result);
            })
        );
    }

    feedbackAssignment(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course-play/feedback/assignment', JSON.stringify(params), { headers: this.httpHeaders });
    }

    courseAttendance(courseId): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/elearning/course/attendance/' + courseId, { headers: this.httpHeaders });
    }

    setBobot(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/assign-assessment-weight', JSON.stringify(params), { headers: this.httpHeaders });
    }

    getCourseAssessmentList(courseId): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/elearning/course/assessment/' + courseId + '/list');
    }

    setFinalAssessmentCandidate(params): Observable<any> {
        return this._httpClient.post<any>(this._apiUrl + '/elearning/course/final-assessment', JSON.stringify(params), { headers: this.httpHeaders });
    }

    // previewSertifikat(params): Observable<any> {
    //     return this._httpClient.get<any>(this._apiUrl + '/elearning/course/certificate/preview', {
    //         headers: this.httpHeaders,
    //         params
    //     });
    // }

    previewSertifikat(params): Observable<any> {
        return this._httpClient.get<any[]>(this._apiUrl + '/elearning/course/certificate/preview?courcesId=' + params.courseId + '&pnsId=' + params.pnsId,
            this.__HTTPHeaderBlob(this._authService.accessToken, 'blob')
        ).pipe(
            map((response: any) => response)
        );
    }

}
