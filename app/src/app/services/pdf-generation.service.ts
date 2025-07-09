import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfGenerationService {

  constructor() { }

  generatePdfFromHtml(htmlElement: HTMLElement, fileName: string): Observable<Blob> {
    return new Observable(observer => {
      html2canvas(htmlElement, {
        scale: 1.5,
        useCORS: true,
        width: 4000,
        height: 2828
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const pdf = new jsPDF('landscape', 'pt', [4000, 2828]);
        pdf.addImage(imgData, 'JPEG', 0, 0, 4000, 2828);
        const pdfBlob = pdf.output('blob');
        observer.next(pdfBlob);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
} 