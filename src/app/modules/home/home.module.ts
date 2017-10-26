import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { HttpClientModule } from '@angular/common/http';
import {
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatExpansionModule,
    MatInputModule,
    MatDialogModule
} from '@angular/material';

import { HomeComponent, AddCategoryComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        CdkTableModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatGridListModule,
        MatExpansionModule,
        MatInputModule,
        MatDialogModule,
        HttpClientModule,
        HomeRoutingModule
    ],
    entryComponents: [
        AddCategoryComponent
    ],
    declarations: [HomeComponent, AddCategoryComponent]
})
export class HomeModule { }
