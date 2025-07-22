import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        loadChildren: () => import('./list/list.module').then(m => m.SurveyDaftarHadirListModule)
      },
      {
        path: ':id',
        loadChildren: () => import('./detail/detail.module').then(m => m.SurveyDaftarHadirDetailModule)
      }
    ])
  ]
})
export class SurveyDaftarHadirModule { }