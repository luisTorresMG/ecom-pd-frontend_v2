import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationComponent } from './configuration.component';
import { ConfigurationService } from '../shared/services/configuration/configuration.service';

describe('ConfigurationComponent', () => {
  let app: ConfigurationComponent;
  let fixture: ComponentFixture<ConfigurationComponent>;

  let configurationService: ConfigurationService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigurationComponent],
      providers: [ConfigurationService],
    }).compileComponents();

    configurationService = TestBed.inject(ConfigurationService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Desgravamen grupal (Configuración de estructuras) - should create', () => {
    expect(app).toBeTruthy();
  });

  it('#GetEntities', (done: DoneFn) => {
    configurationService.getEntities().subscribe((response: any) => {
      /* Checking that the response has a field called success and that it is true. */
      expect(response.success).toBeTruthy();

      interface IEntity {
        id: string;
        campo: string;
        descripcion: string;
        valorCampo: Array<string>;
      }

      const entities: Array<IEntity> = response.listaEntidades;
      expect(Array.isArray(entities)).toBeTruthy();

      /* Checking that every element in the array has a field called valorCampo that is an array. */
      const fieldValueIsArray = entities.every((x) =>
        Array.isArray(x.valorCampo)
      );
      expect(fieldValueIsArray).toBeTruthy();

      /* Checking that the array of entities has unique ids. */
      const uniqueEntityIds = Array.from(new Set(entities.map((x) => x.id)));
      expect(uniqueEntityIds.length == entities.length).toBeTruthy();

      /* Checking that every element in the array has a field called campo and descripcion. */
      expect(entities.every((x) => x.campo)).toBeTruthy();
      expect(entities.every((x) => x.descripcion)).toBeTruthy();
      done();
    });
  });

  it('#GetRules', (done: DoneFn) => {
    interface IRule {
      id: string;
      nombreFuncion: string;
      descripcion: string;
      tipoTransaccion: string;
      tipoRegla: string;
    }
    configurationService.getRules().subscribe((response: Array<IRule>) => {
      /* Checking that the response is an array. */
      expect(Array.isArray(response)).toBeTruthy();

      /* Checking that the array of rules has unique ids. */
      const uniqueRuleIds: Array<any> = Array.from(
        new Set(response.map((x) => x.id))
      );
      expect(uniqueRuleIds.length == response.length).toBeTruthy();

      /* Checking that every value in the array of rules is not empty. */
      const nonEmptyRuleValues = response.every((x) =>
        Object.values(x).every((y) => y)
      );
      expect(nonEmptyRuleValues).toBeTruthy();

      /* Checking that the values of the fields tipoTransaccion and tipoRegla are valid. */
      const transactionTypes = ['Afiliacion', 'De pago'];
      const ruleTypes = ['General', 'Especial', 'Comun'];

      const transactionTypesIsValid = response.every((x) =>
        transactionTypes.includes(x.tipoTransaccion)
      );
      const ruleTypesIsValid = response.every((x) =>
        ruleTypes.includes(x.tipoRegla)
      );

      expect(transactionTypesIsValid).toBeTruthy();
      expect(ruleTypesIsValid).toBeTruthy();
      done();
    });
  });

  it('#GetPolicies', (done: DoneFn) => {
    configurationService.getPolicies(null).subscribe((response: any) => {
      interface IPolicy {
        producto: string;
        numeroPoliza: string;
        fechaInicio: string;
        fechaFin: string;
        moneda: string;
        ruc: string;
        contratante: string;
        canal: string;
      }
      const policies: Array<IPolicy> = response.listadoPolizas;

      /* Checking that the policies variable is an array. */
      expect(Array.isArray(policies)).toBeTruthy();

      /* Checking that the array of policies has unique ids. */
      const singlePolicy = Array.from(
        new Set(policies.map((x) => x.numeroPoliza))
      );
      expect(singlePolicy.length == policies.length).toBeTruthy();

      /* Checking that every value in the array of policies is not empty. */
      const nonEmptyPolicyValues = policies.every((x) =>
        Object.values(x).every((y) => y)
      );
      expect(nonEmptyPolicyValues).toBeTruthy();
      done();
    });
  });
});
