import { NgModule } from '@angular/core';

import { URLEscapePipe } from './urlescape.pipe';

@NgModule({
    declarations: [
        URLEscapePipe
    ],
    exports: [
        URLEscapePipe
    ]
})
export class URLEscapeModule { }
