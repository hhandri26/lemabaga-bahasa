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
        loadChildren: () => import('./list/list.module').then(m => m.SurveyStatistikListModule)
      },
      {
        path: ':id',
        loadChildren: () => import('./detail/detail.module').then(m => m.SurveyStatistikDetailModule)
      }
    ])
  ]
})
export class SurveyStatistikModule { }