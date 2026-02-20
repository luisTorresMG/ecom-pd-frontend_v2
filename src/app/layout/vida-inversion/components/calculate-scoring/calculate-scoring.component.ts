import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VidaInversionService } from '../../services/vida-inversion.service';

@Component({
  standalone: false,
  selector: 'app-scoring-calculation',
  templateUrl: './calculate-scoring.component.html',
  styleUrls: ['./calculate-scoring.component.scss']
})
export class CalculateScoringComponent implements OnInit {
  @Input() comments: { SDESCRIPTION: string }[] = [];
  @Input() profileId: number = 0;
  @Input() quoteStateId: number = 0;
  @Input() stateId: number = 0;
  @Input() quoteId: number = 0;
  @Input() readonly: boolean = false;
  @Input() scoreValue?: number = null;
  @Input() isOnPreliminary?: number = 0;
  @Input() typeClient?: number = 1;
  @Input() nidAsCon?: number = 1;

  @Output() qualification = new EventEmitter<{qualification: string; typeClient: number}>();

  scoreQualification: string = '---';
  isScoreDisplayed: boolean = false;
  isAllowToCalculate: boolean = false;
  scoreMessage: string = '';
  isLoading: boolean = false;

  constructor(private scoringService: VidaInversionService) { }

  ngOnInit(): void {
    this.evaluateRoles();
    if (this.readonly) this.isAllowToCalculate = false;
    if (!this.isAllowToCalculate) this.setScoreQualification();
    if (this.isAllowToCalculate && this.scoreValue != 0.0) {
      this.GetScoreQualification(this.scoreValue);
    }
  }

  private setScoreQualification() {
    console.log('this.scoreValue ', this.scoreValue);
    if (this.scoreValue === null || this.scoreValue === undefined) {
      this.setQualification('---');
      this.setScoreMessage('El puntaje no ha sido calculado');
    } else {
      // get qualification by the scoreValue
      this.scoreQualification = ''
      this.GetScoreQualification(this.scoreValue);
    }
  }

  private GetScoreQualification(scoreValue: number): void {
    console.log('GetScoreQualification', scoreValue);
    var copy: number = scoreValue;
    var scoreValueString = copy.toString();

    //TODO: refactor
    if (scoreValueString.includes('.')) {
      scoreValueString = scoreValueString.split('.')[0];
    }

    if (scoreValueString.length === 2) {
      copy = parseFloat(scoreValueString) / 10;
    } else if (scoreValueString.length === 3) {
      copy = parseFloat(scoreValueString) / 100;
    }

    var data = {
      P_NID_COTIZACION: this.quoteId,
      P_NTYPE_CLIENT: this.typeClient,
      P_NSCORE: copy
    }

    this.scoringService.GetScoreQualification(data).subscribe(
      (response) => {
        if (response.isSuccess) {
          this.setQualification(response.data);
          this.setScoreMessage('');
        } else {
          this.setQualification('---');
          this.setScoreMessage(response.message || 'Error desconocido');
        }
        this.qualification.emit({qualification: this.scoreQualification, typeClient: this.typeClient});
      },
      () => {
        this.setQualification('---');
        this.setScoreMessage('Error al obtener la calificación');``
        this.qualification.emit({qualification: this.scoreQualification, typeClient: this.typeClient});
      }
    );
  }

  /**
   * Determines if the user can view and calculate the score
   */
  private evaluateRoles(): void {
    const roleId = Number(this.profileId);
    this.isScoreDisplayed = [203, 196, 192].includes(roleId) && !this.isOnPreliminary;
    // const pendingAndToSupport = roleId === 192 && this.quoteStateId == 1 && this.stateId == 3;  // VIGP-KAFG 10/04/2025
    const pendingAndToSupport = roleId === 192 &&  this.stateId == 3; // VIGP-KAFG 10/04/2025
    this.setIsAllowToCalculate(pendingAndToSupport);
  }

  /**
   * Fetches the calculated score from the API and updates the UI accordingly.
   */
  getCalculatedScore(): void {
    this.isLoading = true;
    this.scoringService.GetCalculatedScore(this.quoteId, this.typeClient).subscribe(
      (response) => {
        this.isLoading = false;
        const qualification = response.Data?.sQualification;

        if (response.IsSuccess) {
          // Case (a): Successful response, display sQualification
          const score = response.Data?.nScore;
          this.setQualification(qualification);
          this.scoreValue = score;
          this.setScoreMessage('');
          this.setIsAllowToCalculate(false);

          this.qualification.emit({qualification: this.scoreQualification, typeClient: this.typeClient});
        } else {
          // Case (b): Error response, display "---" and store the message for tooltip
          this.setQualification(qualification ?? '---');
          this.setScoreMessage(response.Message || 'Error desconocido');
          this.setIsAllowToCalculate(false);
        }
      },
      () => {
        this.isLoading = false;
        // Case (c): HTTP error, display error message
        this.setQualification('---');
        this.setScoreMessage('Error de comunicación con el servicio');
      }
    );
  }

  getTitle():string{
    if(this.nidAsCon == 1 ) return 'Contratante y Asegurado';
    if(this.typeClient == 1) return 'Contratante';
    return 'Asegurado';
  }

  setQualification(qualification: string): void {
    this.scoreQualification = qualification;
  }

  setScoreMessage(message: string): void {
    this.scoreMessage = message;
  }

  setIsAllowToCalculate(value: boolean): void {
    this.isAllowToCalculate = value;
  }
}
