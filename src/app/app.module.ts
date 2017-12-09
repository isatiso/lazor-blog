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
import { NavProfileService } from 'service/nav-profile.service';
import { MarkdownService } from 'service/markdown.service';
import { AccountService } from 'service/account.service';
import { CategoryDatabaseService } from 'service/category-database.service';
import { ArticleDatabaseService } from 'service/article-database.service';
import { SnackBarService } from 'service/snack-bar.service';
import { ScrollorService } from 'service/scrollor.service';
import { NavButtonService } from 'service/nav-button.service';
import { AuthGuard } from 'guard/auth.guard';
import { ArticleOwnerGuard } from 'guard/article-owner.guard';
import { LeaveGuard } from 'guard/leave.guard';
import { NavButtonModule } from 'public/nav-button/nav-button.module';

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
        NavButtonModule,
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
        NavButtonService,
        AuthGuard,
        LeaveGuard,
        ArticleOwnerGuard],
    entryComponents: [
        ProfileComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
