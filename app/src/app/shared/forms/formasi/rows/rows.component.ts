import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';


@Component({
  selector: 'app-form-formasi-rows',
  templateUrl: './rows.component.html',
  styleUrls: ['./rows.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormasiRowsComponent extends FieldArrayType {
}
