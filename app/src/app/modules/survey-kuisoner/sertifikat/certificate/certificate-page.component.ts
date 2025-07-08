import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ActivatedRoute } from '@angular/router';
import { CertificateHistoryService } from '../history/certificate-history.service';

@Component({
  selector: 'app-certificate-page',
  templateUrl: './certificate-page.component.html',
  styleUrls: ['./certificate-page.component.scss']
})
export class CertificatePageComponent implements OnInit, AfterViewInit {
  @ViewChild('hiddenCertificate', { static: false }) hiddenCertificate!: ElementRef;

  certificate: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private certificateService: CertificateHistoryService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const certificateId = params['id'];
      console.log('Certificate ID from URL:', certificateId);

      if (certificateId) {
        this.certificateService.getCertificateById(certificateId).subscribe({
          next: (response) => {
            if (response.success && response.mapData && response.mapData.certificate) {
              this.certificate = {
                ...response.mapData.certificate,
              };
              console.log('Loaded Certificate Data (Dynamic):', this.certificate);

              if (params['downloadTrigger'] === 'true') {
                // Ensure the certificate data is loaded before attempting to download
                // A small delay might be necessary to ensure the DOM is ready
                setTimeout(() => {
                  this.downloadPDF();
                }, 500);
              }
            } else {
              console.warn('Certificate data not found for ID:', certificateId, response);
              this.certificate = null;
            }
          },
          error: (err) => {
            console.error('Error fetching certificate by ID:', err);
            this.certificate = null;
          }
        });
      } else {
        console.warn('Certificate ID not provided in query parameters.');
      }
    });
  }

  ngAfterViewInit(): void {
    // Any post-render logic can go here
  }

  downloadPDF(): void {
    if (!this.certificate) {
      console.warn('Certificate data not available for download.');
      return;
    }

    const hiddenEl = this.hiddenCertificate.nativeElement.querySelector('.certificate-bg.download-mode');
    if (!hiddenEl) {
      console.error('Hidden certificate element not found for download.');
      return;
    }

    html2canvas(hiddenEl, {
      scale: 1.5,
      useCORS: true,
      width: 4000,
      height: 2828
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF('landscape', 'pt', [4000, 2828]);
      pdf.addImage(imgData, 'JPEG', 0, 0, 4000, 2828);
      pdf.save(`${this.certificate.certificateNumber}-(${this.certificate.nama}).pdf`);
    }).catch(error => {
      console.error('Error generating PDF:', error);
    });
  }

  formatDate(dateArray: number[] | undefined): string {
    if (!dateArray || dateArray.length < 3) {
      return '';
    }
    const [year, month, day] = dateArray;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  formatTime(timeArray: number[] | undefined): string {
    if (!timeArray || timeArray.length < 3) {
      return '';
    }
    const [hour, minute, second] = timeArray;
    return `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`;
  }
}