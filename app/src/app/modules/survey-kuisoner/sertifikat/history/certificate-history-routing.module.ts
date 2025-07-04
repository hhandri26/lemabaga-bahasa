import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CertificateHistoryComponent } from './certificate-history.component';

const routes: Routes = [
  {
    path: '',
    component: CertificateHistoryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CertificateHistoryRoutingModule {} 