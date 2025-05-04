/* eslint-disable id-blacklist */
/* eslint-disable no-new-wrappers */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
	selector: 'formly-field-number',
	template: '{{numberWithCommas(+formControl.value)}}'
})
export class TypeNumberComponent extends FieldType {
	numberWithCommas(x) {
		const number = new Number(x).toFixed(2);
		return number.toString().replace(/\./g,',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	}
}
