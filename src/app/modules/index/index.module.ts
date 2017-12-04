import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
    MatCardModule,
    MatTableModule,
    MatInputModule,
    MatChipsModule,
    MatButtonModule
} from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';

import { IndexRoutingModule } from './index-routing.module';
import { IndexComponent, IndexArticleComponent } from './index.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatInputModule,
        MatTableModule,
        MatChipsModule,
        MatButtonModule,
        CdkTableModule,
        IndexRoutingModule
    ],
    declarations: [
        IndexComponent,
        IndexArticleComponent
    ]
})
export class IndexModule { }
