import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private baseUrl = environment.apiUrl;

  constructor(private _httpClient: HttpClient) { }

  sendCertificateEmail(recipientEmail: string, subject: string, messageBody: string, pdfBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('recipientEmail', recipientEmail);
    formData.append('subject', subject);
    formData.append('messageBody', messageBody);
    formData.append('file', pdfBlob, 'certificate.pdf');

    return this._httpClient.post(this.baseUrl + '/public/email/send-certificate', formData);
  }
}