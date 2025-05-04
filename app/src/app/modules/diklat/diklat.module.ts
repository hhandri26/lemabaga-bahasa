import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { MatTabsModule } from '@angular/material/tabs';
import { diklatRoutes } from './diklat.routing';
import { DiklatListComponent } from './list/list.component';
import { DiklatDetailsComponent } from './details/details.component';
import { DiklatComponent } from './diklat.component';
import { MatMenuModule } from '@angular/material/menu';
import { CreateComponent } from './create/create.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { PesertaComponent } from './peserta/peserta.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SertifikatComponent } from './sertifikat/sertifikat.component';
import { KehadiranComponent } from './kehadiran/kehadiran.component';
import { PenilaianComponent } from './penilaian/penilaian.component';
import { DiklatKelolaComponent } from './kelola/kelola.component';
import { FormDiklatModule } from 'app/shared/forms/diklat/form-diklat.module';
import { VimeModule } from '@vime/angular';
import { FormlyModule } from '@ngx-formly/core';
import { InstrukturComponent } from './instruktur/instruktur.component';
import { MatRadioModule } from '@angular/material/radio';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { CreateSesiComponent } from './create-sesi/create-sesi.component';
import { CreateAktivitasComponent } from './create-aktivitas/create-aktivitas.component';
import { NgxMaskModule } from 'ngx-mask';
import { CreateAktivitasMateriComponent } from './create-aktivitas-materi/create-aktivitas-materi.component';
import { CreateAktivitasUrlComponent } from './create-aktivitas-url/create-aktivitas-url.component';
import { CreateAktivitasTugasMateriComponent } from './create-aktivitas-tugas-materi/create-aktivitas-tugas-materi.component';
import { FuseCardModule } from '@fuse/components/card';
import { AttendanceComponent } from './kelola/aktivitas/attendance/attendance.component';
import { CreateTestComponent } from './create-test/create-test.component';
import { WidgetsModule } from 'app/shared/widgets/widgets.module';
import { DiklatActivityPipeModule } from 'app/pipes/diklat-activity/diklat-activity.module';
import { SetBobotComponent } from './set-bobot/set-bobot.component';
import { MatSliderModule } from '@angular/material/slider';
import { SetTemplateSertifikatComponent } from './set-template-sertifikat/set-template-sertifikat.component';

@NgModule({
    declarations: [
        DiklatComponent,
        DiklatDetailsComponent,
        DiklatListComponent,
        CreateComponent,
        PesertaComponent,
        SertifikatComponent,
        PenilaianComponent,
        KehadiranComponent,
        DiklatKelolaComponent,
        InstrukturComponent,
        CreateSesiComponent,
        CreateAktivitasComponent,
        CreateAktivitasMateriComponent,
        CreateAktivitasUrlComponent,
        CreateAktivitasTugasMateriComponent,
        AttendanceComponent,
        CreateTestComponent,
        SetBobotComponent,
        SetTemplateSertifikatComponent
    ],
    imports: [
        RouterModule.forChild(diklatRoutes),
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatExpansionModule,
        MatProgressBarModule,
        MatSelectModule,
        MatRadioModule,
        DragDropModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatSliderModule,
        FuseFindByKeyPipeModule,
        SharedModule,
        MatTabsModule,
        MatMenuModule,
        MatDialogModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatTableModule,
        MatPaginatorModule,
        MatCheckboxModule,
        FormDiklatModule,
        VimeModule,
        FormlyModule,
        FuseCardModule,
        NgxMaskModule.forRoot(),
        WidgetsModule,
        DiklatActivityPipeModule
    ]
})
export class DiklatModule {
}
