import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatButtonModule, MatDialogModule, MatInputModule } from '@angular/material';

import { InputDialogComponent } from './input-dialog.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatDialogModule
    ],
    declarations: [
        InputDialogComponent
    ],
    entryComponents: [
        InputDialogComponent
    ],
    exports: [
        InputDialogComponent
    ]
})
export class InputDialogModule { }
