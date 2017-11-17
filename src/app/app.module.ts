import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import {
    MatSnackBar,
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatGridListModule,
    MatMenuModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule
} from '@angular/material';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from 'app-routing.module';
import { AppComponent, ProfileComponent } from 'app.component';
import { NavBgDirective } from 'directive/nav-bg.directive';
import { MarkdownDirective } from 'directive/markdown.directive';
import { NavProfileService } from 'service/nav-profile/nav-profile.service';
import { MarkdownService } from 'service/markdown/markdown.service';
import { AccountService } from 'service/account/account.service';
import { CategoryDatabaseService } from 'service/category-database/category-database.service';
import { ArticleDatabaseService } from 'service/article-database/article-database.service';
import { SnackBarService } from 'service/snack-bar/snack-bar.service';
import { ScrollorService } from 'service/scrollor//scrollor.service';
import { AuthGuard } from 'guard/auth.guard';
import { ArticleOwnerGuard } from 'guard/article-owner.guard';

@NgModule({
    declarations: [
        AppComponent,
        ProfileComponent,
        NavBgDirective
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatToolbarModule,
        MatButtonModule,
        MatInputModule,
        MatGridListModule,
        MatDialogModule,
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
        SnackBarService,
        HttpClient,
        MatSnackBar,
        ScrollorService,
        AuthGuard,
        ArticleOwnerGuard],
    entryComponents: [
        ProfileComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
