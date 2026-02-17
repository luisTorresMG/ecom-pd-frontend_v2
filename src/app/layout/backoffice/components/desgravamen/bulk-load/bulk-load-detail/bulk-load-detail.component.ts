import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

import {
  IDetailProcess,
  IDetailProcessResponse,
} from '../../shared/interfaces/process.interface';
import { UtilsService } from '@shared/services/utils/utils.service';
import { BulkLoadService } from '../../shared/services/bulk-load/bulk-load.service';
import { ConfigurationService } from '../../shared/services/configuration/configuration.service';

@Component({
  selector: 'app-bulk-load-detail',
  templateUrl: './bulk-load-detail.component.html',
  styleUrls: ['./bulk-load-detail.component.sass'],
  providers: [UtilsService, BulkLoadService, ConfigurationService],
})
export class BulkLoadDetailComponent implements OnInit {
  processId: number = null;

  tabSelected: 1 | 2 | 3 | 4 = 1;

  rules$: any[] = [];
  functions$: any[] = [];

  detail$: Partial<IDetailProcess> = {};
  summaryRead$: any = {};
  summaryValidate$: any = {};
  summaryMigrate$: any = {};
  summaryBilling$: any = {};

  errorsRead$: any[] = [];
  errorsValidate$: any[] = [];
  errorsMigrate$: any[] = [];
  errorsBilling$: any[] = [];
  extraPremium$: any[] = undefined;

  currentPageErrors = 1;
  currentPageExtraPremium = 1;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly spinner: NgxSpinnerService,
    private readonly bulkLoadService: BulkLoadService,
    private readonly renderer: Renderer2
  ) {
  }

  ngOnInit(): void {
    this.getParameters();
  }

  set tab(value: 1 | 2 | 3 | 4) {
    this.tabSelected = value;
    this.currentPageErrors = 1;
    this.currentPageExtraPremium = 1;

    if (value == 2) {
      this.getExtraPremium();
    }
  }

  /**
   * It gets the rules and parameters from the server and then calls the getDetailProcess() function.
   */
  getParameters(): void {
    this.spinner.show();

    forkJoin([
      this.bulkLoadService.getRulesReport(),
      this.bulkLoadService.getFunctions(),
    ]).subscribe({
      next: (response: any[]) => {
        this.spinner.hide();

        this.rules$ = response[0] ?? [];
        this.functions$ = response[1]?.map((obj) => ({
          idFuncion: +obj.idFuncion,
          funcion: obj.nombreFuncion,
        }));

        this.functions$ = this.functions$.concat([
          {
            funcion: 'ValidacionDuplicado',
            idFuncion: 100,
          },
          {
            funcion: 'ValidacionPeriodoDeDeclaracion',
            idFuncion: 101,
          },
        ]);

        this.getDetailProcess();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  /**
   * If the extraPremium$ array is empty, then call the getExtraPremium() function.
   * @returns An array of objects.
   */
  getExtraPremium(): void {
    if (this.extraPremium$?.length >= 0) {
      return;
    }

    this.spinner.show();
    this.bulkLoadService
        .getExtraPremium({
          idProceso: this.processId,
        })
        .subscribe({
          next: (response: any[]) => {
            this.extraPremium$ = response;
            this.spinner.hide();
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
            this.spinner.hide();
          },
        });
  }

  getRuleDescription(id: number): string {
    return this.rules$.find((x) => +x.id == +id)?.descripcion ?? '';
  }

  getFunctionDescription(id: number): string {
    return this.functions$.find((x) => +x.idFuncion == +id)?.funcion ?? '';
  }

  /**
   * "This function gets the detail of a process by its id, if the process id is not found, it
   * redirects to the bulk load tray, if the process id is found, it gets the summary of the process."
   * </code>
   * @returns {
   *   "detalleProceso": {
   *     "idProceso": "1",
   *     "nombreArchivo": "archivo.xlsx",
   *     "fechaInicio": "2020-01-01T00:00:00",
   *     "fechaFin": "2020-01-01T00:
   */
  private getDetailProcess(): void {
    this.processId = this.route.snapshot.params['id'];

    if (!this.processId) {
      this.router.navigate(['/backoffice/desgravamen/carga-masiva/bandeja']);
      return;
    }

    this.spinner.show();
    this.bulkLoadService.getDetailProcess(this.processId).subscribe({
      next: (response: IDetailProcessResponse) => {
        this.detail$ = response.detalleProceso;

        if (!response.success) {
          this.router.navigate([
            '/backoffice/desgravamen/carga-masiva/bandeja',
          ]);
          return;
        }

        this.getSummary();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => this.spinner.hide(),
    });
  }

  /**
   * It gets the summary of the process and then gets all the errors.
   */
  private getSummary(): void {
    this.spinner.show();

    const payload = {
      idProceso: this.processId,
    };

    this.bulkLoadService.getSummary(payload).subscribe({
      next: (response: any) => {
        /* Assigning a value to the variables summaryRead$, summaryValidate$ and summaryMigrate$. */
        const summary = response.verErrores ?? [];
        this.summaryRead$ = summary.find((x) => x.fase == 1) ?? {};
        this.summaryValidate$ = summary.find((x) => x.fase == 2) ?? {};
        this.summaryMigrate$ = summary.find((x) => x.fase == 3) ?? {};
        this.summaryBilling$ = summary.find((x) => x.fase == 4) ?? {};

        if (!response.success) {
          this.spinner.hide();
          return;
        }

        this.getAllErrors(response.verErrores);
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  /**
   * It takes an array of objects, each object has a linkError property, if the linkError property is
   * not null, it will call the bulkLoadService.getUrlResponse() function and return the result,
   * otherwise it will return an empty array.
   *
   * The bulkLoadService.getUrlResponse() function returns an Observable.
   *
   * The forkJoin() function takes an array of Observables and returns an Observable.
   *
   * The forkJoin() function will wait for all the Observables to complete and then return the result.
   *
   * The forkJoin() function will return an array of arrays, each array is the result of the
   * Observable.
   *
   * The forkJoin() function will return an empty array if the Observable returns an empty array.
   */
  private getAllErrors(list: any[]): void {
    if (!list.length) {
      this.spinner.hide();
      return;
    }

    /* Creating an array of Observables. */
    const observables: Array<Observable<any>> = (list ?? []).map((obj) => {
      const emptyObservable = new Observable((obs) => {
        obs.next([]);
        obs.complete();
      });
      return !obj.linkError
        ? emptyObservable
        : this.bulkLoadService.getUrlResponse(obj.linkError);
    });

    interface IError {
      attribute: string;
      client: string;
      credit: string;
      error: string;
      function: number;
      idDocument: string;
      registry: number;
      transaction: string;
      typeDocument: string;
    }

    this.spinner.show();
    forkJoin(observables).subscribe({
      next: (res: Array<Array<IError>>) => {
        /* Assigning a value to the variables errorsRead$, errorsValidate$ and errorsMigrate$. */
        this.errorsRead$ = (res[0] ?? []).map((obj) => ({
          ...obj,
          function: this.getFunctionDescription(obj.function),
        }));

        this.errorsValidate$ = (res[1] ?? []).map((obj) => ({
          ...obj,
          function: this.getRuleDescription(obj.function),
        }));

        this.errorsMigrate$ = (res[2] ?? []).map((obj) => ({
          ...obj,
          function: this.getRuleDescription(obj.function),
        }));

        this.errorsBilling$ = (res[3] ?? []).map((obj) => ({
          ...obj,
          function: this.getRuleDescription(obj.function),
        }));

        this.spinner.hide();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
  }

  /**
   * It gets the errors from the server and downloads them as a CSV file.
   */
  getUrlErrorsByPhase(): void {
    this.spinner.show();

    const payload = {
      idProceso: this.processId,
      fase: this.tabSelected,
    };

    forkJoin([
      this.bulkLoadService.getUrlErrorsByPhase(payload),
      this.bulkLoadService.downloadReprocessFile(payload)
    ]).subscribe({
      next: (response: any[]) => {
        this.spinner.hide();

        if (!response) {
          return;
        }

        this.downloadFileCSV(response[0]);

        if (response[1]?.link) {
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.href = response[1].link;
          a.click();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
    });
        }

  /**
   * It takes a url, makes a request to the url, and then downloads the response as a csv file.
   *
   * @param {string} url - string = 'http://localhost:8080/api/v1/bulk-load/download/csv/{id}';
   */
  private downloadFileCSV(url: string): void {
    this.spinner.show();
    this.bulkLoadService.getCSVFileErrors(url).subscribe({
      next: (response) => {
        const blob = new Blob([response], {
          type: 'text/csv',
        });
        const urlFIle = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.href = urlFIle;
        a.download = urlFIle.split('?')[0].split('/').pop();
        a.click();
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }
}
