import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PenerjemahComponent } from './penerjemah.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatRippleModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { PenerjemahListComponent } from './list/list.component';
import { PenerjemahDetailsComponent } from './details/details.component';
import { RouterModule } from '@angular/router';
import { JfpItemResolver, JfpListResolver } from './penerjemah.resolvers';
import moment from 'moment';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CanDeactivateJfpDetails } from './penerjemah.guards';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FuseAlertModule } from '@fuse/components/alert';
import { NgxMaskModule } from 'ngx-mask';
import { FindReferencePipeModule } from 'app/pipes/find-reference/find-reference.module';
import { RiwayatModule } from 'app/shared/riwayat/riwayat.module';
import { CreateComponent } from './create/create.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateComponentAdmin } from './create_admin/createadmin.component';
import { CreateComponentKepegawaian } from './create_kepegawaian/createkepegawaian.component';
import { CreateComponentPengajar } from './create_pengajar/createpengajar.component';
import { CreateComponentAsesor } from './create_asesor/createasesor.component';


@NgModule({
    declarations: [
        PenerjemahComponent,
        PenerjemahListComponent,
        PenerjemahDetailsComponent,
        CreateComponent,
        CreateComponentAdmin,
        CreateComponentKepegawaian,
        CreateComponentAsesor,
        CreateComponentPengajar,

    ],
    imports: [
        // CommonModule,
        RouterModule.forChild(
            [
                {
                    path: '',
                    component: PenerjemahComponent,
                    children: [
                        {
                            path: '',
                            component: PenerjemahListComponent,
                            resolve: {
                                jfpList: JfpListResolver
                            },
                            children: [
                                {
                                    path: ':id',
                                    component: PenerjemahDetailsComponent,
                                    resolve: {
                                        jfpItem: JfpItemResolver,
                                        // dataUtama: DataUtamaResolver
                                    },
                                    canDeactivate: [CanDeactivateJfpDetails],
                                }
                            ]
                        }
                    ]
                }
            ]
        ),
        RiwayatModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatProgressBarModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatTableModule,
        MatPaginatorModule,
        MatTooltipModule,
        FuseFindByKeyPipeModule,
        SharedModule,
        MatDialogModule,
        MatAutocompleteModule,
        MatNativeDateModule,
        FuseAlertModule,
        NgxMaskModule.forRoot(),
        FindReferencePipeModule
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: moment.ISO_8601
                },
                display: {
                    dateInput: 'LL',
                    monthYearLabel: 'MMM YYYY',
                    dateA11yLabel: 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        }
    ]
})
export class PenerjemahModule { }
