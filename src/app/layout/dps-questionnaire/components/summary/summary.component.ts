import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DpsService } from '../../shared/services/dps.service';
@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.sass'],
})
export class SummaryComponent implements OnInit {
  summary = this.dpsService.storage?.summary;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly dpsService: DpsService
  ) {}

  ngOnInit(): void {}

  tryAgain(): void {
    this.router.navigate([
      `/dps/${this.activatedRoute.parent.snapshot.params['token']}/auth`,
    ]);
  }
}
