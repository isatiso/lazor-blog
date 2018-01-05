import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatButtonModule, MatDialogModule } from '@angular/material';

import { WarningComponent } from './warning.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
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
