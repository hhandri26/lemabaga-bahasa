import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DiklatTimeComponent } from './form-input/diklat-time.component';
import { DiklatTextareaComponent } from './form-input/diklat-textarea.component';
import { DiklatTextComponent } from './form-input/diklat-text.component';
import { DiklatDateComponent } from './form-input/diklat-date.component';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DiklatDateRangeComponent } from './form-input/diklat-date-range.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { FormlyModule } from '@ngx-formly/core';
import { SesiAddComponent } from './sections/sesi-section.type';
import { ActivityGroupAddComponent } from './sections/activity-group-section.type';
import { ActivityAddComponent } from './sections/activity-section.type';
import { TimeFormatInput } from './sections/time-format.type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMaskModule } from 'ngx-mask';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CkeditorFormatInput } from './sections/ckeditor-format.type';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';

@NgModule({
    declarations: [
        DiklatTimeComponent,
        DiklatTextComponent,
        DiklatDateComponent,
        DiklatTextareaComponent,
        DiklatDateRangeComponent,
        TimeFormatInput,
        CkeditorFormatInput,
        SesiAddComponent,
        ActivityGroupAddComponent,
        ActivityAddComponent
    ],
    imports: [
        SharedModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatDatepickerModule,
        FormlyMatDatepickerModule,
        MatMomentDateModule,
        MatFormFieldModule,
        NgxMaskModule,
        FormsModule,
        CKEditorModule,
        FormlyModule.forRoot({
            extras: { lazyRender: true },
            types: [
                { name: 'sesi', component: SesiAddComponent },
                { name: 'activity_group', component: ActivityGroupAddComponent },
                { name: 'activity', component: ActivityAddComponent },
                { name: 'time_format', component: TimeFormatInput },
                { name: 'ckeditor_format', component: CkeditorFormatInput },
            ],
          }),
          FormlyMaterialModule,
    ],
    exports: [
        DiklatTimeComponent,
        DiklatTextComponent,
        DiklatDateComponent,
        DiklatTextareaComponent,
        DiklatDateRangeComponent
    ]
})
export class FormDiklatModule { }
