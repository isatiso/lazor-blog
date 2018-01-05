import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatCardModule,
    MatIconModule,
} from '@angular/material';

import { ArticleRoutingModule } from './article-routing.module';
import { ArticleComponent } from './article.component';
import { MarkdownModule } from 'public/markdown/markdown.module';

@NgModule({
    imports: [
        CommonModule,
        MarkdownModule,
        MatCardModule,
        MatIconModule,
        ArticleRoutingModule
    ],
    declarations: [ArticleComponent]
})
export class ArticleModule { }
