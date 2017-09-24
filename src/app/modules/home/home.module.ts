import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule, MdTableModule } from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';

import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({
    imports: [
        CommonModule,
        CdkTableModule,
        MdTableModule,
        MaterialModule,
        HomeRoutingModule
    ],
    declarations: [HomeComponent]
})
export class HomeModule { }
