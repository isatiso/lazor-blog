import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material';

import { IndexRoutingModule } from './index-routing.module';
import { IndexComponent, IndexArticleComponent } from './index.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        MatCardModule,
        IndexRoutingModule
    ],
    declarations: [
        IndexComponent,
        IndexArticleComponent
    ]
})
export class IndexModule { }
