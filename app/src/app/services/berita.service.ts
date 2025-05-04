/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
// import { AnnouncementPagination, Announcement } from './announcement.types';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class BeritaService {
    _apiUrl = `${environment.apiUrl}/public/berita/filter`;

    httpHeaders = new HttpHeaders({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });
    uploadHttpHeaders = new HttpHeaders({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Accept': '*/*',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });
    // Private
    private _pagination: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _item: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _announcements: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get pagination$(): Observable<any> {
        return this._pagination.asObservable();
    }

    get announcement$(): Observable<any> {
        return this._item.asObservable();
    }

    get announcements$(): Observable<any[]> {
        return this._announcements.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get items
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getList(page: number = 0, size: number = 10, sort: string = 'updated_at', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<{ pagination: any; items: any[] }> {
        return this._httpClient.get<{ pagination: any; items: any[] }>(this._apiUrl, {
            params: {
                page: '' + page,
                limit: '' + size,
                sortedBy: order,
                orderBy: sort,
                search
            }
        }).pipe(
            tap((response) => {
                this._pagination.next(response.pagination);
                this._announcements.next(response.items);
            })
        );
    }

    getDetail(id):
        Observable<any> {
        return this._httpClient.get<any>(this._apiUrl + '/' + id).pipe(
            tap((response) => {
                if (response?.status) {
                    this._item.next(response.data);
                }
            })
        );
    }

    getAnnouncementById(id: string): Observable<any> {
        return this._announcements.pipe(
            take(1),
            map((items) => {
                const announcement = items.find(item => item.id === id) || null;
                this._item.next(announcement);
                return announcement;
            }),
            switchMap((announcement) => {
                if (!announcement) {
                    return throwError('Tidak dapat menemukan pengumuman dengan id #' + id + '!');
                }
                return of(announcement);
            })
        );
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    __HTTPHeaderBlob(token, responseType: any) {
        return {
            headers: new HttpHeaders(
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Content-Type': 'application/json',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Authorization': 'Bearer ' + token
                }), responseType: responseType
        };
    }

    previewDocument(id): Observable<any> {
        return this._httpClient.get<any[]>(`${environment.apiUrl}/auth/document/upload/${id}`,
            this.__HTTPHeaderBlob(this._authService.accessToken, 'blob')
        ).pipe(
            map((response: any) => response)
        );
    }

    uploadDocument(id: string, files: File, isAttach = false): Observable<any> {
        const body: FormData = new FormData();
        body.append('files', files);

        return this.announcements$.pipe(
            take(1),
            switchMap(announcement => this._httpClient.post<any>(environment.apiUrl + '/auth/document/upload', body, {
                headers: this.uploadHttpHeaders
            }).pipe(
                map((updatedAnnouncement) => {
                    if (!updatedAnnouncement.status) {
                        return;
                    }
                    const index = announcement.findIndex(item => item.id === id);

                    if (isAttach) {
                        announcement[index].document_uploads.push(updatedAnnouncement.data);
                    } else {
                        announcement[index].source_image = updatedAnnouncement.data;
                    }

                    this._announcements.next(announcement);
                    return updatedAnnouncement;
                })
            ))
        );
    }
}
