import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatButtonModule, MatDialogModule, MatIconModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';

import { ArticleComponent, PreviewComponent } from './article.component';
import { ArticleRoutingModule } from './article-routing.module';
import { MarkdownModule } from 'directive/markdown.module';

@NgModule({
    imports: [
        CommonModule,
        MarkdownModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
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
