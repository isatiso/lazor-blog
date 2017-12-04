import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatDialogModule } from '@angular/material';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';
import { MarkdownModule } from 'public/markdown/markdown.module';
import { PreviewModule } from 'preview//preview.module';

@NgModule({
    imports: [
        CommonModule,
        PreviewModule,
        MarkdownModule,
        MatCardModule,
        MatDialogModule,
        AboutRoutingModule
    ],
    declarations: [
        AboutComponent
    ]
})
export class AboutModule { }
