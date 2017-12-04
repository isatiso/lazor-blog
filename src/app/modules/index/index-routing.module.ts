import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexComponent, IndexArticleComponent } from './index.component';

const routes: Routes = [
    {
        path: '',
        component: IndexComponent,
        data: { title: 'index', scrollLimit: 276 },
        children: [
            {
                path: '',
                component: IndexArticleComponent,
                data: { title: 'index', scrollLimit: 276 }
            },
            {
                path: ':category_id',
                component: IndexArticleComponent,
                data: { title: 'index', scrollLimit: 276 }
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class IndexRoutingModule { }
