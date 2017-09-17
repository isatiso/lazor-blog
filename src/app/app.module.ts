import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MaterialModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';

const la_routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadChildren: './modules/home/home.module#HomeModule' },
    { path: 'article', loadChildren: './modules/article/article.module#ArticleModule' },
];

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        RouterModule.forRoot(la_routes)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
