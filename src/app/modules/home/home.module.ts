import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { HttpClientModule } from '@angular/common/http';
import {
    MatMenuModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatInputModule,
    MatDialogModule
} from '@angular/material';

import { SortablejsModule } from 'angular-sortablejs';

import { HomeComponent, AddCategoryComponent, WarningComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        CdkTableModule,
        MatMenuModule,
        MatCardModule,
        MatTableModule,
        MatChipsModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatGridListModule,
        MatExpansionModule,
        MatSlideToggleModule,
        MatInputModule,
        MatDialogModule,
        HttpClientModule,
        HomeRoutingModule,
        SortablejsModule.forRoot({})
    ],
    entryComponents: [
        AddCategoryComponent,
        WarningComponent,
    ],
    declarations: [
        HomeComponent,
        AddCategoryComponent,
        WarningComponent
    ]
})
export class HomeModule { }
