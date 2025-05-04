import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReplacePipeModule } from 'app/pipes/replace/replace.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgxMaskModule } from 'ngx-mask';
import { MatDialogModule } from '@angular/material/dialog';
import { FuseAlertModule } from '@fuse/components/alert';
import { ListComponent } from './list/list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseCardModule } from '@fuse/components/card';
import { QuillModule } from 'ngx-quill';
import { SurveyKuisonerUserComponent } from './survey-user-kuisoner.component';
import { IsiComponent } from './isi/isi.component';
import { WidgetsModule } from 'app/shared/widgets/widgets.module';
import { StartResolver } from './survey-user-kuisoner.resolvers';
import { ListRespondenComponentKuisoner } from '../survey-kuisoner/list-responden/list-responden.component';

@NgModule({
    declarations: [
        SurveyKuisonerUserComponent,
        ListComponent,
        IsiComponent,
        ListRespondenComponentKuisoner
    ],
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: SurveyKuisonerUserComponent,
                // resolve: {
                //     categories: JenisForumResolver
                // },
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: ListComponent,
                        // resolve: {
                        //     courses: QuizzesResolver
                        // }
                    },
                    {
                        path: 'start/:id',
                        component: IsiComponent,
                        resolve: {
                            courses: StartResolver
                        }
                    }
                ]
            }
        ]),
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
export class SurveyKuisonerUserModule { }
