import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatTabsModule, MatButtonModule, MatInputModule, MatIconModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';
import { MarkdownDirective } from 'directive/markdown.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatTabsModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        EditorRoutingModule
    ],
    declarations: [EditorComponent, MarkdownDirective]
})
export class EditorModule { }
