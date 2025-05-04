import { NgModule } from '@angular/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { FormlyModule } from '@ngx-formly/core';
import { SharedModule } from '../../shared.module';
import { TypeNumberComponent } from '../_types/number.type';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormasiFormulaComponent } from './formula/formula.component';
import { FormasiRowsComponent } from './rows/rows.component';
import { TypeStringComponent } from '../_types/string.type';
import { FuseAlertModule } from '@fuse/components/alert';
import { FormasiApproveComponent } from './approve/approve.component';

@NgModule({
  declarations: [FormasiFormulaComponent, FormasiRowsComponent, TypeStringComponent, TypeNumberComponent, FormasiApproveComponent],
  imports: [
    SharedModule,
    FormlyModule.forRoot({
      extras: { lazyRender: true },
      types: [
        { name: 'form_formasi_rows', component: FormasiRowsComponent },
        { name: 'form_formasi_formula', component: FormasiFormulaComponent },
        { name: 'type_number', component: TypeNumberComponent },
        { name: 'type_string', component: TypeStringComponent },
        { name: 'form_formasi_approve', component: FormasiApproveComponent },
      ],
    }),
    FormlyMaterialModule,
    MatIconModule,
    MatButtonModule,
    FuseAlertModule
  ]
})
export class FormFormasiModule { }
