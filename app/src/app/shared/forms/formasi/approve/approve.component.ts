import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';


@Component({
  selector: 'app-form-formasi-approve',
  templateUrl: './approve.component.html',
  styleUrls: ['./approve.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormasiApproveComponent extends FieldArrayType {
}


