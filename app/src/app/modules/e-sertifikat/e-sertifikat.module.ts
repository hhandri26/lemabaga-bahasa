import { NgModule } from '@angular/core';
import { CertificateModule } from './certificate/certificate.module';
import { CertificateRoutingModule } from './certificate/certificate-routing.module';

@NgModule({
  imports: [CertificateModule, CertificateRoutingModule]
})
export class EsertifikatModule {} 