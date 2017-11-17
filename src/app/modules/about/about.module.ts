import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';

@NgModule({
    imports: [
        CommonModule,
        MatCardModule,
        AboutRoutingModule
    ],
    declarations: [AboutComponent]
})
export class AboutModule { }
