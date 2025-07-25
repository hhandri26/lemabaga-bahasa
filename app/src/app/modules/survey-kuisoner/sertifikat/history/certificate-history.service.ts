import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class CertificateHistoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCertificates(email: string): Observable<any> {
    const formData = new FormData();
    formData.append('email', email);

    return this.http.post<any>(`${this.apiUrl}/public/certificate-email`, formData);
  }

  getCertificateById(id: string): Observable<any> {
    const formData = new FormData();
    formData.append('id', id);
    return this.http.post<any>(`${this.apiUrl}/public/certificate-id`, formData);
  }

  getAllCertificates(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/public/certificate/all`);
  }

  updateCertificateRwPelatihanId(sertifikatId: string, rwPelatihanId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/public/certificate-id/update?id=${sertifikatId}`, { rwPelatihanId });
  }
}