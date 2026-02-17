import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { UsoService } from '../../../services/uso/uso.service';
import { Uso } from '../../../models/use/use';

@Component({
  selector: 'app-uso',
  templateUrl: './uso.component.html',
  styleUrls: ['./uso.component.css']
})
export class UsoComponent implements OnInit {
  @Output() evResultUso = new EventEmitter<number>();
  ResultUso = 0;
  mensaje: string;
  usos: any[];
  uso = new Uso('0', '');
  constructor(private usoService: UsoService) { }

  ngOnInit() {
    this.usoService.getPostUsos(this.uso)
      .subscribe(
        data => {
          this.usos = <any[]>data;
        },
        error => {
          console.log(error);
        }
      );
  }

  throwUso(resultUso: number) {
    this.evResultUso.emit(resultUso);
  }

  onSelectUso(usoId) {
    this.ResultUso = usoId;
    this.throwUso(usoId);
  }

}
