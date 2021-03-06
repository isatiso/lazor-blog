import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatChipsModule,
    MatButtonModule,
    MatSlideToggleModule
} from '@angular/material';

import { SortablejsModule } from 'angular-sortablejs';

import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { URLEscapeModule } from 'urlescape/urlescape.module';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        MatIconModule,
        MatCardModule,
        MatInputModule,
        MatChipsModule,
        MatButtonModule,
        MatSlideToggleModule,
        HomeRoutingModule,
        URLEscapeModule,
        SortablejsModule.forRoot({})
    ],
    declarations: [
        HomeComponent,
    ]
})
export class HomeModule { }
