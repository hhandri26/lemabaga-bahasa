import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
	selector: 'formly-field-string',
	template: '{{formControl.value}}'
})
export class TypeStringComponent extends FieldType {

}
