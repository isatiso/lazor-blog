import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material';

import { IndexRoutingModule } from './index-routing.module';
import { IndexComponent, IndexArticleComponent } from './index.component';
import { URLEscapeModule } from 'urlescape/urlescape.module';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        MatCardModule,
        URLEscapeModule,
        IndexRoutingModule
    ],
    declarations: [
        IndexComponent,
        IndexArticleComponent
    ]
})
export class IndexModule { }
