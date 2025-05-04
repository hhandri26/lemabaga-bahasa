import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import moment from 'moment';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
interface ApiResponse {
    success: boolean;
    message: string; 
    mapData: {
        pnsList: {
            id: string;
            nama: string;
            nip: string;
            provinsiNama: string;
        }[];
    };
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private _apiUrl = `${environment.apiUrl}/dashboard`;

    private _dashboard: BehaviorSubject<any | null> = new BehaviorSubject(null);

    constructor(private _httpClient: HttpClient) {}

    get dashboard$(): Observable<any> {
        return this._dashboard.asObservable();
    }

    all(): Observable<any> {
        return this._httpClient.get<any>(this._apiUrl).pipe(
            tap((response) => {
                if (response?.success) {
                    this._dashboard.next(response.mapData);
                }
            })
        );
    }

    getByProvinsi(provinsiNama: string): Observable<ApiResponse> {
    return this._httpClient.get<ApiResponse>(`${this._apiUrl}/pns/by-provinsi/${provinsiNama}`);
}

}
