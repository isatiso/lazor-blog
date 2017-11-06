import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { 
    MatSnackBar, 
    MatToolbarModule, 
    MatButtonModule, 
    MatGridListModule, 
    MatMenuModule, 
    MatIconModule, 
    MatSnackBarModule
} from '@angular/material';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from 'app-routing.module';
import { AppComponent } from 'app.component';
import { NavBgDirective } from 'directive/nav-bg.directive';
import { MarkdownDirective } from 'directive/markdown.directive';
import { NavProfileService } from 'service/nav-profile/nav-profile.service';
import { MarkdownService } from 'service/markdown/markdown.service';
import { AccountService } from 'service/account/account.service';
import { CategoryDatabaseService } from 'service/category-database/category-database.service';
import { ArticleDatabaseService } from 'service/article-database/article-database.service';
import { AuthGuard } from 'guard/auth.guard';
import { ArticleOwnerGuard } from 'guard/article-owner.guard';

@NgModule({
    declarations: [
        AppComponent,
        NavBgDirective
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        MatToolbarModule,
        MatButtonModule,
        MatGridListModule,
        MatIconModule,
        MatMenuModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        AppRoutingModule
    ],
    providers: [
        NavProfileService,
        MarkdownService,
        AccountService,
        CategoryDatabaseService,
        ArticleDatabaseService,
        HttpClient,
        MatSnackBar,
        AuthGuard,
        ArticleOwnerGuard],
    bootstrap: [AppComponent]
})
export class AppModule { }
