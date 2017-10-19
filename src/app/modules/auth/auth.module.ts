import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatInputModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatInputModule,
        HttpClientModule,
        AuthRoutingModule
    ],
    declarations: [AuthComponent]
})
export class AuthModule { }
