import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MaterialModule } from '@angular/material';

import { AppRoutingModule } from 'app-routing.module';
import { AppComponent } from 'app.component';
import { NavBgDirective } from 'directive/nav-bg.directive';
import { MarkdownDirective } from 'directive/markdown.directive';
import { NavProfileService } from 'service/nav-profile/nav-profile.service';
import { MarkdownService } from 'service/markdown/markdown.service';

@NgModule({
    declarations: [
        AppComponent,
        NavBgDirective
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        AppRoutingModule
    ],
    providers: [NavProfileService, MarkdownService],
    bootstrap: [AppComponent]
})
export class AppModule { }
