import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IndexStepsComponent } from "./index-steps.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    IndexStepsComponent,
  ],
  exports: [
    IndexStepsComponent,
  ]
})
export class IndexStepsModule { }
