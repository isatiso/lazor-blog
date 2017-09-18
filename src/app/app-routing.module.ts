import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: 'home', loadChildren: './modules/home/home.module#HomeModule' },
    { path: 'auth', loadChildren: './modules/auth/auth.module#AuthModule' },
    { path: 'article', loadChildren: './modules/article/article.module#ArticleModule' },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    declarations: []
})
export class AppRoutingModule { }
