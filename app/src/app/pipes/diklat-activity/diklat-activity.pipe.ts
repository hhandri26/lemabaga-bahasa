

import { Pipe, PipeTransform } from '@angular/core';
import { HelperService } from 'app/services/helper.service';

@Pipe({
    name: 'diklatType',
    pure: false
})
export class DiklatDctivityPipe implements PipeTransform {
    constructor(protected helperService: HelperService) { }

    transform(value: any, args?: any): any {
        const item: any = this.helperService.diklatType().find(list => list.value === value);
        if (item) {
            return item.text;
        }
        return value;
    }
}
