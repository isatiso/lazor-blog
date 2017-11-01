import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatTableModule, MatInputModule, MatButtonModule } from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';

import { IndexRoutingModule } from './index-routing.module';
import { IndexComponent } from './index.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatInputModule,
        MatTableModule,
        MatButtonModule,
        CdkTableModule,
        IndexRoutingModule
    ],
    declarations: [IndexComponent]
})
export class IndexModule { }
