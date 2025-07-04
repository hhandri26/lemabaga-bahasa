import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CertificatePageComponent } from './certificate-page.component';

const routes: Routes = [
  { path: '', component: CertificatePageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CertificateRoutingModule {} 