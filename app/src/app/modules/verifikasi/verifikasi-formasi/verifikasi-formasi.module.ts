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
import { ListResolver } from './verifikasi-riwayat.resolvers';
import { FuseConfirmationModule } from '@fuse/services/confirmation';
import { NgxMaskModule } from 'ngx-mask';
import { FuseLoadingBarModule } from '@fuse/components/loading-bar';
import { VerifikasiFormasiComponent } from './verifikasi-formasi.component';
import { ReplacePipeModule } from 'app/pipes/replace/replace.module';

@NgModule({
    declarations: [
        VerifikasiFormasiComponent,
        ListComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                component: VerifikasiFormasiComponent,
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
        ReplacePipeModule
    ]
})
export class VerifikasiFormasiModule { }
