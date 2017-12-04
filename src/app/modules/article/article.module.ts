import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
} from '@angular/material';
import { HttpClientModule } from '@angular/common/http';

import { ArticleComponent } from './article.component';
import { ArticleRoutingModule } from './article-routing.module';
import { PreviewModule } from 'public/preview/preview.module';
import { MarkdownModule } from 'public/markdown/markdown.module';

@NgModule({
    imports: [
        CommonModule,
        PreviewModule,
        MarkdownModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatDialogModule,
        HttpClientModule,
        ArticleRoutingModule
    ],
    declarations: [ArticleComponent]
})
export class ArticleModule { }
