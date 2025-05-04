import { NgModule } from '@angular/core';
import { DiklatDctivityPipe } from './diklat-activity.pipe';

@NgModule({
    declarations: [
        DiklatDctivityPipe
    ],
    exports     : [
        DiklatDctivityPipe
    ]
})
export class DiklatActivityPipeModule
{
}
