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
    MatTooltipModule
} from '@angular/material';

import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent, InputComponent } from './editor.component';
import { MarkdownModule } from 'directive/markdown.module';

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
        EditorRoutingModule
    ],
    entryComponents: [
        InputComponent
    ],
    declarations: [EditorComponent, InputComponent]
})
export class EditorModule { }
