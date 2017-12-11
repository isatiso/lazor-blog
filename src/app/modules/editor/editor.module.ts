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
import { EditorComponent } from './editor.component';
import { InputDialogModule } from 'public/input-dialog/input-dialog.module';
import { WarningModule } from 'public/warning/warning.module';
import { NavButtonModule } from 'public/nav-button/nav-button.module';
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
        NavButtonModule,
        WarningModule,
        InputDialogModule,
        EditorRoutingModule
    ],
    declarations: [
        EditorComponent
    ]
})
export class EditorModule { }
