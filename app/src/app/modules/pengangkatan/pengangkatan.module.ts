import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from 'app/shared/shared.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PengangkatanComponent } from './pengangkatan.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FuseAlertModule } from '@fuse/components/alert';
import { ListResolver } from './pengangkatan.resolvers';
import { FuseConfirmationModule } from '@fuse/services/confirmation';
import { NgxMaskModule } from 'ngx-mask';
import { FuseLoadingBarModule } from '@fuse/components/loading-bar';
import { ReplacePipeModule } from 'app/pipes/replace/replace.module';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { FormFormasiModule } from 'app/shared/forms/formasi/formasi.module';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SubmitUsulanComponent } from './submit-usulan/submit-usulan.component';
import { DetailUsulanComponent } from './detail-usulan/detail-usulan.component';
import { SubmitUsulanApprovedComponent } from './submit-usulan-approved/submit-usulan-approved.component';
import { ReturnUsulComponent } from './return-usul/return-usul.component';
import { FindReferencePipeModule } from 'app/pipes/find-reference/find-reference.module';
import { SubmitSkComponent } from './submit-sk/submit-sk.component';
import { SetCompleteComponent } from './set-complete/set-complete.component';

@NgModule({
    declarations: [
        PengangkatanComponent,
        ListComponent,
        CreateComponent,
        SubmitUsulanComponent,
        DetailUsulanComponent,
        SubmitUsulanApprovedComponent,
        ReturnUsulComponent,
        SubmitSkComponent,
        SetCompleteComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: PengangkatanComponent,
                children: [
                    {
                        path: '',
                        component: ListComponent,
                        resolve: {
                            lists: ListResolver,
                        }
                    }
                ]
            }
        ]),
        FuseLoadingBarModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTooltipModule,
        SharedModule,
        MatTabsModule,
        MatDialogModule,
        FuseAlertModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatTableModule,
        FuseConfirmationModule,
        NgxMaskModule.forRoot(),
        ReplacePipeModule,
        FormlyModule.forRoot({
            extras: { lazyRender: true }
        }),
        FormlyMaterialModule,
        FormFormasiModule,
        MatAutocompleteModule,
        FindReferencePipeModule
    ]
})
export class PengangkatanModule { }
