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
import { ListComponent } from './list/list.component';
import { DetailResolver, ListResolver } from './satuan-organisasi.resolvers';
import { DetailsComponent } from './details/details.component';
import { CanDeactivateDetails } from './satuan-organisasi.guards';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReplacePipeModule } from 'app/pipes/replace/replace.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgxMaskModule } from 'ngx-mask';
import { CreateComponent } from './create/create.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FuseAlertModule } from '@fuse/components/alert';
import { SatuanOrganisasiComponent } from './satuan-organisasi.component';

@NgModule({
  declarations: [
    SatuanOrganisasiComponent, DetailsComponent, ListComponent, CreateComponent
  ],
  imports: [
    RouterModule.forChild([
        {
            path: '',
            component: SatuanOrganisasiComponent,
            children: [
                {
                    path: '',
                    component: ListComponent,
                    resolve: {
                        lists: ListResolver,
                    },
                    children: [
                        {
                            path: ':id',
                            component: DetailsComponent,
                            resolve: {
                                list: DetailResolver
                            },
                            canDeactivate: [CanDeactivateDetails]
                        }
                    ]
                }
            ]
        }
    ]),
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
    SharedModule,
    MatDialogModule,
    ReplacePipeModule,
    FuseAlertModule,
    NgxMaskModule.forRoot(),
  ]
})
export class SatuanOrganisasiModule { }
