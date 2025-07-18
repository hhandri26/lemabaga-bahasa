import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FuseCardModule } from '@fuse/components/card';
import { FuseAlertModule } from '@fuse/components/alert';
import { SharedModule } from 'app/shared/shared.module';
import { SurveyPublikComponent } from 'app/modules/survey-publik/survey-publik.component';
import { surveyPublikRoutes } from 'app/modules/survey-publik/survey-publik.routing';


import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReplacePipeModule } from 'app/pipes/replace/replace.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgxMaskModule } from 'ngx-mask';
import { MatDialogModule } from '@angular/material/dialog';
// import { ListComponent } from './list/list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { QuillModule } from 'ngx-quill';
// import { SurveyKuisonerUserComponent } from './survey-user-kuisoner.component';
import { PublikIsiComponent } from './isi/isi.component';
import { WidgetsModule } from 'app/shared/widgets/widgets.module';
import { PublikStartResolver } from './survey-publik.resolvers';
import { ListRespondenComponentKuisoner } from '../survey-kuisoner/list-responden/list-responden.component';



@NgModule({
  declarations: [
    SurveyPublikComponent,
    PublikIsiComponent
  ],
  imports: [
    RouterModule.forChild(surveyPublikRoutes),
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FuseCardModule,
    FuseAlertModule,
    SharedModule,
    QuillModule.forRoot(),
    MatButtonModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatMomentDateModule,
    MatProgressBarModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatTableModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    FuseFindByKeyPipeModule,
    MatTabsModule,
    SharedModule,
    MatDialogModule,
    ReplacePipeModule,
    FuseAlertModule,
    FuseCardModule,
    WidgetsModule,
    NgxMaskModule.forRoot(),
  ]
})
export class SurveyPublikModule { }
