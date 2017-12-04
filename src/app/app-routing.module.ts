import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from 'guard/auth.guard';
import { ArticleOwnerGuard } from 'guard/article-owner.guard';
import { LeaveGuard } from 'guard/leave.guard';

const routes: Routes = [
    {
        path: 'home',
        loadChildren: './modules/home/home.module#HomeModule',
        pathMatch: 'full',
        canActivate: [AuthGuard],
        data: { title: 'home', scrollLimit: 0 }
    },
    {
        path: 'auth',
        loadChildren: './modules/auth/auth.module#AuthModule',
        data: { title: 'auth', scrollLimit: 0 }
    },
    {
        path: 'editor/:id',
        loadChildren: './modules/editor/editor.module#EditorModule',
        canActivate: [AuthGuard, ArticleOwnerGuard],
        canDeactivate: [LeaveGuard],
        data: { title: 'editor', scrollLimit: 0, noFooter: true }
    },
    {
        path: 'index',
        loadChildren: './modules/index/index.module#IndexModule',
        data: { title: 'index', scrollLimit: 276 }
    },
    {
        path: 'about',
        loadChildren: './modules/about/about.module#AboutModule',
        data: { title: 'about', scrollLimit: 0 }
    },
    {
        path: 'article',
        loadChildren: './modules/article/article.module#ArticleModule',
        data: { title: 'article', scrollLimit: 0, noFooter: true }
    },
    {
        path: 'error',
        loadChildren: './modules/error/error.module#ErrorModule'
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
        data: { title: 'home', scrollLimit: 276 }
    },
    {
        path: '**',
        redirectTo: '/error'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    declarations: []
})
export class AppRoutingModule { }
