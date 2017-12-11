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

import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { WarningModule } from 'public/warning/warning.module';
import { InputDialogModule } from 'public/input-dialog/input-dialog.module';

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
        InputDialogModule,
        WarningModule,
        HomeRoutingModule,
        SortablejsModule.forRoot({})
    ],
    declarations: [
        HomeComponent
    ]
})
export class HomeModule { }
