import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavMenuProdComponent } from './navmenuprod.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
  ],
  declarations: [
    NavMenuProdComponent,
  ],
  exports: [
    NavMenuProdComponent,
  ],
})
export class NavMenuProdModule { }
