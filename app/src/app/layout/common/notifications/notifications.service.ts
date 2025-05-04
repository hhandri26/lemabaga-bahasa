import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, ReplaySubject, switchMap, take, tap } from 'rxjs';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs'
import { AppResponse } from './appresponses.types';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService
{
      _apiUrl = `${environment.apiUrl}`;
    httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._authService.accessToken,
    });

    private _notifications: ReplaySubject<Notification[]> = new ReplaySubject<Notification[]>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        private _authService: AuthService)
    {
        
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for notifications
     */
    get notifications$(): Observable<Notification[]>
    {
        return this._notifications.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all notifications
     */
getAll(): Observable<Notification[]> {
    return this._httpClient.get<Notification[]>(`${this._apiUrl}/notification/list`).pipe(
        tap((notifications) => {
            this._notifications.next(notifications);
        })
    );
}

    
markAsRead(id: number): Observable<AppResponse> {
    console.log('Marking as read for ID:', id);  // Menambahkan log untuk memeriksa ID
    return this._httpClient.post<AppResponse>(`${this._apiUrl}/notification/mark-as-read/${id}`, {}).pipe(
        catchError((error) => {
            console.error('Error occurred:', error);
            return of({ success: false, message: 'Failed to mark as read', mapData: null });
        })
    );
}




    /**
     * Create a notification
     *
     * @param notification
     */
    create(notification: Notification): Observable<Notification>
    {
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._httpClient.post<Notification>('api/common/notifications', {notification}).pipe(
                map((newNotification) => {

                    // Update the notifications with the new notification
                    this._notifications.next([...notifications, newNotification]);

                    // Return the new notification from observable
                    return newNotification;
                })
            ))
        );
    }


    markAllAsRead(): Observable<boolean>
    {
        return this.notifications$.pipe(
            take(1),
            switchMap(notifications => this._httpClient.get<boolean>('api/common/notifications/mark-all-as-read').pipe(
                map((isUpdated: boolean) => {

                    // Go through all notifications and set them as read
                    notifications.forEach((notification, index) => {
                        notifications[index].read = true;
                    });

                    // Update the notifications
                    this._notifications.next(notifications);

                    // Return the updated status
                    return isUpdated;
                })
            ))
        );
    }
}
