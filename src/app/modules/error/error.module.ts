import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule, MatButtonModule, MatIconModule, MatGridListModule } from '@angular/material';

import { ErrorComponent } from './error.component';

const error_routes: Routes = [
    { path: '', component: ErrorComponent },
    { path: '**', component: ErrorComponent },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatCardModule,
        MatGridListModule,
        MatButtonModule,
        RouterModule.forChild(error_routes)
    ],
    declarations: [ErrorComponent]
})
export class ErrorModule { }
