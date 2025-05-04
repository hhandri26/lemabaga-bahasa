

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Finds an object from given source using the given key - value pairs
 */

@Pipe({
    name: 'findReference',
    pure: false
})
export class FindReferencePipe implements PipeTransform {
    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * Transform
     *
     * @param value A string or an array of strings to find from source
     * @param key Key of the object property to look for
     * @param source Array of objects to find from
     */
    transform(value: string | string[], key: string, source: any[]): any {
        const item = source.find(sourceItem => sourceItem[key] === value);
        return (item) ? item.name : '-';
    }
}
