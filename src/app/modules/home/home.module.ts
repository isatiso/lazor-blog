import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';

const home_routes: Routes = [
    { path: '', component: HomeComponent },
];

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        RouterModule.forChild(home_routes)
    ],
    declarations: [HomeComponent]
})
export class HomeModule { }
