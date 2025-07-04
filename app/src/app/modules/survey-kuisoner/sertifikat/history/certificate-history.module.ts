import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificateHistoryComponent } from './certificate-history.component';
import { CertificateHistoryService } from './certificate-history.service';
import { CertificateHistoryRoutingModule } from './certificate-history-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [CertificateHistoryComponent],
  imports: [
    CommonModule,
    CertificateHistoryRoutingModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  providers: [CertificateHistoryService]
})
export class CertificateHistoryModule {} 