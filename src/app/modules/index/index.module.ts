import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';

import { IndexRoutingModule } from './index-routing.module';
import { IndexComponent } from './index.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    IndexRoutingModule
  ],
  declarations: [IndexComponent]
})
export class IndexModule { }
