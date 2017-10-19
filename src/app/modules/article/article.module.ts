import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material';

import { ArticleComponent } from './article.component';
import { ArticleRoutingModule } from './article-routing.module';

@NgModule({
    imports: [
        CommonModule,
        MatCardModule,
        ArticleRoutingModule
    ],
    declarations: [ArticleComponent]
})
export class ArticleModule { }
