import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: 'home', loadChildren: './modules/home/home.module#HomeModule', data: { title: 'home', scrollLimit: 276 } },
    { path: 'auth', loadChildren: './modules/auth/auth.module#AuthModule', data: { title: 'auth', scrollLimit: 0 } },
    { path: 'editor', loadChildren: './modules/editor/editor.module#EditorModule', data: { title: 'editor', scrollLimit: 0 } },
    { path: 'index', loadChildren: './modules/index/index.module#IndexModule', data: { title: 'index', scrollLimit: 0 } },
    { path: 'about', loadChildren: './modules/about/about.module#AboutModule', data: { title: 'about', scrollLimit: 0 } },
    { path: 'article', loadChildren: './modules/article/article.module#ArticleModule', data: { title: 'article', scrollLimit: 0 } },
    { path: '', redirectTo: 'home', pathMatch: 'full', data: { title: 'home', scrollLimit: 276 } },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    declarations: []
})
export class AppRoutingModule { }
