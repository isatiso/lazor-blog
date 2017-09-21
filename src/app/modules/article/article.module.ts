import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';

import { ArticleComponent } from './article.component';
import { ArticleRoutingModule } from './article-routing.module';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        ArticleRoutingModule
    ],
    declarations: [ArticleComponent]
})
export class ArticleModule { }
