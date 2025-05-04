import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'diklat',
    templateUrl    : './diklat.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiklatComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
