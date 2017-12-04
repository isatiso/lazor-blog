import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressBarModule
} from '@angular/material';

import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent, InputComponent, WarningComponent } from './editor.component';
import { MarkdownModule } from 'public/markdown/markdown.module';

@NgModule({
    imports: [
        CommonModule,
        MarkdownModule,
        FormsModule,
        MatCardModule,
        MatTabsModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatDialogModule,
        MatTooltipModule,
        MatProgressBarModule,
        EditorRoutingModule
    ],
    entryComponents: [
        InputComponent,
        WarningComponent
    ],
    declarations: [
        EditorComponent,
        InputComponent,
        WarningComponent
    ]
})
export class EditorModule { }
