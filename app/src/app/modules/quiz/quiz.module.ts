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
import { JenisForumResolver, QuizDetailResolver, QuizzesResolver } from './quiz.resolvers';
import { DetailsComponent } from './details/details.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReplacePipeModule } from 'app/pipes/replace/replace.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgxMaskModule } from 'ngx-mask';
import { CreateComponent } from './create/create.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FuseAlertModule } from '@fuse/components/alert';
import { QuizComponent } from './quiz.component';
import { ListComponent } from './list/list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseCardModule } from '@fuse/components/card';
import { QuillModule } from 'ngx-quill';
import { QuizAddQustionComponent } from './add-question/add-question.component';
import { QuizEditQuestionComponent } from './edit-question/edit-question.component';

@NgModule({
    declarations: [
        QuizComponent,
        DetailsComponent,
        ListComponent,
        CreateComponent,
        QuizAddQustionComponent,
        QuizEditQuestionComponent
    ],
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: QuizComponent,
                resolve: {
                    categories: JenisForumResolver
                },
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        component: ListComponent,
                        resolve: {
                            courses: QuizzesResolver
                        }
                    },
                    {
                        path: ':id',
                        component: DetailsComponent,
                        resolve: {
                            courses: QuizDetailResolver
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
        NgxMaskModule.forRoot(),
    ]
})
export class QuizModule { }
