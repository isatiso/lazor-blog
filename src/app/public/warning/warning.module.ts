import { NgModule } from '@angular/core';
import { MatIconModule, MatButtonModule, MatDialogModule } from '@angular/material';

import { WarningComponent } from './warning.component';

@NgModule({
    imports: [
        MatIconModule,
        MatButtonModule,
        MatDialogModule
    ],
    declarations: [
        WarningComponent
    ],
    entryComponents: [
        WarningComponent
    ],
    exports: [
        WarningComponent
    ]
})
export class WarningModule { }
