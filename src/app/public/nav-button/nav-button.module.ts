// angular module
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// non-angular module
import { MatIconModule, MatButtonModule, MatTooltipModule } from '@angular/material';

// local module
import { NavButtonComponent } from './nav-button.component';

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule
    ],
    declarations: [
        NavButtonComponent
    ],
    // entryComponents: [
    //     NavButtonComponent
    // ],
    exports: [
        NavButtonComponent
    ]
})
export class NavButtonModule { }
