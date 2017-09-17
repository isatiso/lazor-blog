import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ArticleComponent } from './article.component';

const article_routes: Routes = [
    { path: '', component: ArticleComponent },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(article_routes)
    ],
    declarations: [ArticleComponent]
})
export class ArticleModule { }
