import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { Route, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from 'app/shared/shared.module';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { BeritaComponent } from './berita/berita.component';
import { StatistikComponent } from './statistik/statistik.component';
import { FaqComponent } from './faq/faq.component';
import { AdminComponent } from './home/admin/admin.component';
import { UserComponent } from './home/user/user.component';
import { GuideComponent } from './guide/guide.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FuseCardModule } from '@fuse/components/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseAlertModule } from '@fuse/components/alert';
import { ReplacePipeModule } from 'app/pipes/replace/replace.module';

const routes: Route[] = [
    {
        path     : '',
        component: DashboardComponent
    }
];

@NgModule({
    declarations: [
        DashboardComponent,
        BeritaComponent,
        StatistikComponent,
        FaqComponent,
        AdminComponent,
        UserComponent,
        GuideComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatButtonModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatIconModule,
        MatExpansionModule,
        MatMenuModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        FuseCardModule,
        NgApexchartsModule,
        MatTooltipModule,
        SharedModule,
        FuseAlertModule,
        ReplacePipeModule
    ]
})
export class DashboardModule { }
