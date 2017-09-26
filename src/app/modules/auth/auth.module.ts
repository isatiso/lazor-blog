import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        HttpClientModule,
        AuthRoutingModule
    ],
    declarations: [AuthComponent]
})
export class AuthModule { }
