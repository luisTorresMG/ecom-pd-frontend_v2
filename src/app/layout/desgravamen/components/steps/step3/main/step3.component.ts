import { Component, OnInit, ViewContainerRef, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DesgravamenService } from '../../../../shared/services/desgravamen.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.scss']
})
export class Step3Component implements OnInit {

  @ViewChild('details', { read: TemplateRef }) _detailsPlan: TemplateRef<any>;

  constructor(
    private readonly _router: Router,
    private readonly _desgravamenService: DesgravamenService,
    private readonly _spinner: NgxSpinnerService,
    private readonly _viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit(): void {
  }
  showPlanDetail(): void {
    // this._router.navigate(['/desgravamen/step3/plan-detail']);
    this._viewContainerRef.createEmbeddedView(this._detailsPlan);
  }
  hidePlan(e): void {
    this._viewContainerRef.clear();
  }
  submit(): void {
    this._spinner.show();
    setTimeout(() => {
      this._spinner.hide();
      this._desgravamenService.step = 4;
      this._router.navigate(['/desgravamen/step4']);
    }, 1500);
  }

  backStep(): void {
    this._desgravamenService.step = 2;
    this._router.navigate(['/desgravamen/step2']);
  }
}
