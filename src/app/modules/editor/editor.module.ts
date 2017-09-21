import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';
import { FormsModule } from '@angular/forms';

import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';
import { MarkdownDirective } from 'directive/markdown.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        EditorRoutingModule
    ],
    declarations: [EditorComponent, MarkdownDirective]
})
export class EditorModule { }
