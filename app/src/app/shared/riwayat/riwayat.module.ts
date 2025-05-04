import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PelatihanComponent } from './pelatihan/pelatihan.component';
import { UjiKompetensiComponent } from './uji-kompetensi/uji-kompetensi.component';
import { UjiBerbahasaComponent } from './uji-berbahasa/uji-berbahasa.component';
import { GolonganComponent } from './golongan/golongan.component';
import { JabatanComponent } from './jabatan/jabatan.component';
import { KegiatanPenerjemahanComponent } from './kegiatan-penerjemahan/kegiatan-penerjemahan.component';
import { PendidikanComponent } from './pendidikan/pendidikan.component';
import { PenguasaanBahasaComponent } from './penguasaan-bahasa/penguasaan-bahasa.component';
import { AngkaKreditComponent } from './angka-kredit/angka-kredit.component';
import { DataUtamaComponent } from './data-utama/data-utama.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseAlertModule } from '@fuse/components/alert';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { NgxMaskModule } from 'ngx-mask';
import { FindReferencePipeModule } from 'app/pipes/find-reference/find-reference.module';
import { SharedModule } from '../shared.module';
import { MatTabsModule } from '@angular/material/tabs';
import { UsulanComponent } from './usulan/usulan.component';
import { MutasiComponent } from './mutasi/mutasi.component';

@NgModule({
    declarations: [
        PelatihanComponent,
        UjiKompetensiComponent,
        UjiBerbahasaComponent,
        GolonganComponent,
        JabatanComponent,
        KegiatanPenerjemahanComponent,
        PendidikanComponent,
        PenguasaanBahasaComponent,
        AngkaKreditComponent,
        DataUtamaComponent,
        UsulanComponent,
        MutasiComponent,
    ],
    imports: [
        SharedModule,
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
        MatAutocompleteModule,
        MatNativeDateModule,
        FuseAlertModule,
        MatTabsModule,
        NgxMaskModule.forRoot(),
        FindReferencePipeModule
    ],
    exports: [
        PelatihanComponent,
        UjiKompetensiComponent,
        UjiBerbahasaComponent,
        GolonganComponent,
        JabatanComponent,
        KegiatanPenerjemahanComponent,
        PendidikanComponent,
        PenguasaanBahasaComponent,
        AngkaKreditComponent,
        DataUtamaComponent,
        UsulanComponent,
        MutasiComponent,
    ]
})
export class RiwayatModule
{
}
