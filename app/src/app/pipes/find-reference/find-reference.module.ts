import { NgModule } from '@angular/core';
import { FindReferencePipe } from './find-reference.pipe';

@NgModule({
    declarations: [
        FindReferencePipe
    ],
    exports     : [
        FindReferencePipe
    ]
})
export class FindReferencePipeModule
{
}
