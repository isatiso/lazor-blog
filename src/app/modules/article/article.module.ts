import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatButtonModule, MatIconModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';

import { ArticleComponent } from './article.component';
import { ArticleRoutingModule } from './article-routing.module';
import { MarkdownModule } from 'directive/markdown.module';

@NgModule({
    imports: [
        CommonModule,
        MarkdownModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        HttpClientModule,
        ArticleRoutingModule
    ],
    declarations: [ArticleComponent]
})
export class ArticleModule { }
