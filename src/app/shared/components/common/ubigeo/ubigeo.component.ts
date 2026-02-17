import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { UbigeoService } from '../../../services/ubigeo/ubigeo.service';
import { District } from '../../../models/district/district';
import { Province } from '../../../models/province/province';
import { Municipality } from '../../../models/municipality/municipality';

@Component({
  selector: 'app-ubigeo',
  templateUrl: './ubigeo.component.html',
  styleUrls: ['./ubigeo.component.css']
})
export class UbigeoComponent implements OnInit {
  @Output() evResultDep = new EventEmitter<number>();
  ResultDep = 0;
  @Output() evResultPro = new EventEmitter<number>();
  ResultPro = 0;
  @Output() evResultDis = new EventEmitter<number>();
  ResultDis = 0;

  province = new Province('0', '');
  provinces: any[];
  districts: any[];
  municipalitys: any[];
  constructor(
    private ubigeoService: UbigeoService
  ) { }

  ngOnInit() {
    this.ubigeoService.getPostProvince(this.province)
      .subscribe(
        data => {
          this.provinces = <any[]>data;
        },
        error => {
          console.log(error);
        }
      );
  }

  onSelectDepartment(depId) {
    this.ResultDep = depId;
    this.throwDep(depId);

    this.municipalitys = [];
    if (depId === '0') {
      this.districts = [];
      this.throwDis(depId);
      this.throwPro(depId);
    } else {
      const district = new District('0', depId, '');
      this.ubigeoService.getPostDistrict(district)
        .subscribe(
          data => {
            this.districts = <any[]>data;
          },
          error => {
            console.log(error);
          }
        );
    }
  }

  onSelectProvince(proId) {
    this.ResultPro = proId;
    this.throwPro(proId);

    if (proId === '0') {
      this.municipalitys = [];
      this.throwDis(proId);
    } else {
      const municipality = new Municipality('0', proId, '');
      this.ubigeoService.getPostMunicipality(municipality)
        .subscribe(
          data => {
            this.municipalitys = <any[]>data;
          },
          error => {
            console.log(error);
          }
        );
    }
  }

  onSelectDistrict(disId) {
    this.ResultDis = disId;
    this.throwDis(disId);
  }

  throwDis(resultDis: number) {
    this.evResultDis.emit(resultDis);
  }
  throwDep(resultDep: number) {
    this.evResultDep.emit(resultDep);
  }
  throwPro(resultPro: number) {
    this.evResultPro.emit(resultPro);
  }

}
