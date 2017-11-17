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
import { PreviewComponent } from 'component/preview/preview.component';
import { MarkdownModule } from 'directive/markdown.module';

@NgModule({
    imports: [
        CommonModule,
        MarkdownModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatDialogModule,
        HttpClientModule,
        ArticleRoutingModule
    ],
    entryComponents: [
        PreviewComponent
    ],
    declarations: [ArticleComponent, PreviewComponent]
})
export class ArticleModule { }
