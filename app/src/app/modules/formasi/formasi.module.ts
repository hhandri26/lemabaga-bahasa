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
import { FormasiComponent } from './formasi.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FuseAlertModule } from '@fuse/components/alert';
import { ListComponent } from './list/list.component';
import { ListResolver } from './formasi.resolvers';
import { FuseConfirmationModule } from '@fuse/services/confirmation';
import { CreateComponent } from './create/create.component';
import { NgxMaskModule } from 'ngx-mask';
import { FuseLoadingBarModule } from '@fuse/components/loading-bar';
import { ReplacePipeModule } from 'app/pipes/replace/replace.module';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { FormFormasiModule } from 'app/shared/forms/formasi/formasi.module';
import { ApproveMenpanComponent } from './approve-menpan/approve-menpan.component';
import { ReturnUsulComponent } from './return-usul/return-usul.component';
import { ApproveUsulComponent } from './approve-usul/approve-usul.component';
import { ReturnFinalComponent } from './return-final/return-final.component';

@NgModule({
    declarations: [
        FormasiComponent,
        ListComponent,
        CreateComponent,
        ApproveMenpanComponent,
        ReturnUsulComponent,
        ApproveUsulComponent,
        ReturnFinalComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: FormasiComponent,
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
        FormFormasiModule
    ]
})
export class FormasiModule { }
