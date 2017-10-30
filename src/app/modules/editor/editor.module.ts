import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule
} from '@angular/material';

import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';
import { MarkdownModule } from 'directive/markdown.module';

@NgModule({
    imports: [
        CommonModule,
        MarkdownModule,
        FormsModule,
        MatCardModule,
        MatTabsModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        EditorRoutingModule
    ],
    declarations: [EditorComponent]
})
export class EditorModule { }
