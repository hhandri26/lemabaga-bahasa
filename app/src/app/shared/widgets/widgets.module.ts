import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { LampiranDokumenComponent } from './lampiran-dokumen/lampiran-dokumen.component';
import { LampiranYoutubeComponent } from './lampiran-youtue/lampiran-youtube.component';
import { MatIconModule } from '@angular/material/icon';
import { ActivityVideoComponent } from './activity-video/activity-video.component';
import { ActivityYoutubeComponent } from './activity-youtube/activity-youtube.component';
import { ActivityDocumentComponent } from './activity-document/activity-document.component';
import { ActivityAttendanceComponent } from './activity-attendance/activity-attendance.component';
import { ActivityAssignmentComponent } from './activity-assignment/activity-assignment.component';
import { ActivityUrlComponent } from './activity-url/activity-url.component';
import { MatButtonModule } from '@angular/material/button';
import { FuseAlertModule } from '@fuse/components/alert';
import { SubmitAssignmentComponent } from './activity-assignment/submit-assignment/submit-assignment.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PrePostTestComponent } from './pre-post-test/pre-post-test.component';
import { QuizQuestionComponent } from './quiz-question/quiz-question.component';
import { MatRadioModule } from '@angular/material/radio';
import { ActivityAttendanceDialogComponent } from './activity-attendance/activity-attendance-dialog/activity-attendance-dialog.component';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { SurveyQuestionComponent } from './survey-question/survey-question.component';
import { SurveyKuisonerQuestionComponent } from './survey-kuisoner-question/survey-kuisoner-question.component';
import { KuisonerQuestionComponent } from './kuisoner-question/kuisoner-question.component';

@NgModule({
    declarations: [
        LampiranDokumenComponent,
        LampiranYoutubeComponent,
        ActivityYoutubeComponent,
        ActivityVideoComponent,
        ActivityDocumentComponent,
        ActivityAttendanceComponent,
        ActivityAssignmentComponent,
        ActivityUrlComponent,
        PrePostTestComponent,
        SubmitAssignmentComponent,
        QuizQuestionComponent,
        SurveyQuestionComponent,
        KuisonerQuestionComponent,
        SurveyKuisonerQuestionComponent,
        ActivityAttendanceDialogComponent
    ],
    imports: [
        SharedModule,
        MatIconModule,
        MatButtonModule,
        FuseAlertModule,
        MatFormFieldModule,
        MatInputModule,
        MatRadioModule,
        MatTableModule,
        MatPaginatorModule,
        AngularSignaturePadModule
    ],
    exports: [
        LampiranDokumenComponent,
        LampiranYoutubeComponent,
        ActivityYoutubeComponent,
        ActivityVideoComponent,
        ActivityDocumentComponent,
        ActivityAttendanceComponent,
        ActivityAssignmentComponent,
        ActivityUrlComponent,
        PrePostTestComponent,
        QuizQuestionComponent,
        SurveyQuestionComponent,
        KuisonerQuestionComponent,
        SurveyKuisonerQuestionComponent
    ]
})
export class WidgetsModule { }
