import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        AuthRoutingModule
    ],
    declarations: [AuthComponent]
})
export class AuthModule { }
