import { Component, ElementRef, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-certificate-page',
  templateUrl: './certificate-page.component.html',
  styleUrls: ['./certificate-page.component.scss']
})
export class CertificatePageComponent {
  @ViewChild('hiddenCertificate', { static: false }) hiddenCertificate!: ElementRef;

  nama: string = 'Ilham Tri Ade W.';
  nomorSertifikat: string = 'SERT.B-0001/Pusbinter/XII/2025';
  judul: string = 'SOSIALISASI JABATAN FUNGSIONAL PENERJEMAH';
  subjudul: string = 'Subjudul Sosialisasi Jabatan Fungsional Penerjemah';
  tanggal: string = '1 November 2024';
  tempat: string = 'Jakarta';
  jam: string = '2';

  downloadPDF(): void {
    const hiddenEl = this.hiddenCertificate.nativeElement.querySelector('.certificate-bg.download-mode');
    html2canvas(hiddenEl, {
      scale: 1.5,
      useCORS: true,
      width: 4000,
      height: 2828
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF('landscape', 'pt', [4000, 2828]);
      pdf.addImage(imgData, 'JPEG', 0, 0, 4000, 2828);
      pdf.save(`sertifikat-${this.nama}.pdf`);
    });
  }
}