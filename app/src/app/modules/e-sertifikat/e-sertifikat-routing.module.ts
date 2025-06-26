import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CertificateViewerComponent } from './detail/certificate-viewer.component';

const routes: Routes = [
  { path: 'view', component: CertificateViewerComponent, data: { layout: 'empty' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EsertifikatRoutingModule {} 